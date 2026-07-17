/**
 * SSE 流式接收 Hook
 *
 * 基于 fetch + ReadableStream 解析 text/event-stream
 * - 不依赖 EventSource（EventSource 不支持 POST 请求）
 * - 支持 AbortController 中断
 * - 自动解析 event: / data: 多行格式
 *
 * 后端协议（见 api/routes/ai.ts）：
 *   event: meta\ndata: {"provider":"openai","model":"gpt-4o-mini"}\n\n
 *   event: delta\ndata: {"content":"一段"}\n\n
 *   event: delta\ndata: {"content":"token"}\n\n
 *   event: done\ndata: {"elapsedMs":1234}\n\n
 *   event: error\ndata: {"message":"..."}\n\n
 */
import { useCallback, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

export interface SseMeta {
  provider: string;
  model?: string;
}

export interface SseStreamHandlers {
  /** 收到 meta 事件 */
  onMeta?: (meta: SseMeta) => void;
  /** 收到 token 片段 */
  onDelta?: (delta: string) => void;
  /** 流正常结束 */
  onDone?: (elapsedMs: number) => void;
  /** 流异常 */
  onError?: (err: Error) => void;
}

export interface UseSseStreamReturn {
  /** 当前是否正在流式传输 */
  isStreaming: boolean;
  /** 累计已接收的文本 */
  content: string;
  /** Provider 元信息 */
  meta: SseMeta | null;
  /** 错误信息（如有） */
  error: string | null;
  /**
   * 启动一次 SSE 流
   * @param path 相对 /api 的路径，如 "/ai/script/stream"
   * @param body 请求体（JSON）
   * @returns 最终累计的内容（用于 await 后处理）
   */
  start: (path: string, body: unknown) => Promise<string>;
  /** 中断当前流 */
  abort: () => void;
  /** 清空已接收内容与错误 */
  reset: () => void;
}

/**
 * 解析单个 SSE 块（可能包含多个事件）
 * 输入：单个 chunk 字符串
 * 输出：{ event, data } 数组
 */
function parseSseChunk(chunk: string): { event: string; data: string }[] {
  const events: { event: string; data: string }[] = [];
  const blocks = chunk.split("\n\n");
  for (const block of blocks) {
    if (!block.trim()) continue;
    let event = "message";
    const dataLines: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    if (dataLines.length) {
      events.push({ event, data: dataLines.join("\n") });
    }
  }
  return events;
}

export function useSseStream(handlers?: SseStreamHandlers): UseSseStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState("");
  const [meta, setMeta] = useState<SseMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setContent("");
    setMeta(null);
    setError(null);
  }, []);

  const start = useCallback(async (path: string, body: unknown) => {
    // 若已在传输，先中断上一次
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsStreaming(true);
    setError(null);
    setContent("");
    setMeta(null);

    // 局部累积变量，保证 await 返回时拿到最终内容
    // 避免 setState 异步带来的 stale 闭包问题
    let accumulated = "";

    try {
      const res = await fetch(`/api${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      // 后端可能返回 4xx JSON 错误
      if (!res.ok) {
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const err = await res.json();
          throw new ApiError(
            res.status,
            err.error ?? "http_error",
            err.message ?? `HTTP ${res.status}`,
          );
        }
        throw new ApiError(res.status, "http_error", `HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error("响应没有 ReadableStream body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = parseSseChunk(buffer);
        if (events.length) {
          const lastIdx = buffer.lastIndexOf("\n\n");
          if (lastIdx >= 0) {
            buffer = buffer.slice(lastIdx + 2);
          }
          for (const ev of events) {
            try {
              const data = JSON.parse(ev.data);
              if (ev.event === "meta") {
                setMeta(data as SseMeta);
                handlersRef.current?.onMeta?.(data as SseMeta);
              } else if (ev.event === "delta") {
                const delta = (data as { content?: string }).content ?? "";
                if (delta) {
                  accumulated += delta;
                  setContent((c) => c + delta);
                  handlersRef.current?.onDelta?.(delta);
                }
              } else if (ev.event === "done") {
                const elapsedMs =
                  (data as { elapsedMs?: number }).elapsedMs ?? 0;
                handlersRef.current?.onDone?.(elapsedMs);
              } else if (ev.event === "error") {
                const msg = (data as { message?: string }).message ?? "未知错误";
                setError(msg);
                handlersRef.current?.onError?.(new Error(msg));
              }
            } catch {
              // JSON 解析失败，忽略单个事件
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // 用户主动中断，不抛错
      } else {
        const e = err as Error;
        setError(e.message);
        handlersRef.current?.onError?.(e);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
    return accumulated;
  }, []);

  return { isStreaming, content, meta, error, start, abort, reset };
}

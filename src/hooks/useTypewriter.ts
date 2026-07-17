import { useEffect, useRef, useState } from "react";

/**
 * 打字机效果 - 模拟 AI 文本流式输出
 */
export function useTypewriter(
  text: string,
  opts: { speed?: number; enabled?: boolean; onDone?: () => void } = {}
) {
  const { speed = 24, enabled = true, onDone } = opts;
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const id = setInterval(() => {
      indexRef.current += 1;
      const next = text.slice(0, indexRef.current);
      setDisplayed(next);
      if (indexRef.current >= text.length) {
        clearInterval(id);
        setDone(true);
        onDoneRef.current?.();
      }
    }, speed);

    return () => clearInterval(id);
  }, [text, enabled, speed]);

  return { displayed, done };
}

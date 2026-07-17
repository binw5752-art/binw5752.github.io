import type { Request, Response, NextFunction } from "express";

/** 统一错误响应格式 */
export interface ApiError {
  error: string;
  message: string;
  status: number;
  provider?: string;
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "not_found",
    message: `路径 ${req.method} ${req.path} 不存在`,
    status: 404,
  } satisfies ApiError);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[api] error:", err.message);
  const status = (err as Error & { status?: number }).status ?? 500;
  res.status(status).json({
    error: err.name || "internal_error",
    message: err.message,
    status,
  } satisfies ApiError);
}

/** 包装异步路由处理函数 */
export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

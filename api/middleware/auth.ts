/**
 * JWT 认证中间件
 * - 从 Authorization: Bearer <token> 头读取并校验
 * - 把 user 挂到 req.user
 * - 提供 requireAuth / optionalAuth 两种用法
 */
import type { Request, Response, NextFunction } from "express";
import { verifyToken, getUserById, AuthError } from "../services/auth";
import type { User } from "../../shared/types";

// 扩展 Express Request 类型，挂载 user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization ?? "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  // 兼容 query 参数（仅用于 SSE 这种不便设 header 的场景）
  if (typeof req.query.token === "string") {
    return req.query.token;
  }
  return null;
}

/** 必须登录，否则 401 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return next(new AuthError(401, "unauthorized", "请先登录"));
  }
  try {
    const { userId } = verifyToken(token);
    const user = getUserById(userId);
    if (!user) {
      return next(new AuthError(401, "user_not_found", "用户已失效，请重新登录"));
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** 可选登录：有 token 就解析，没 token 也放行 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const { userId } = verifyToken(token);
    const user = getUserById(userId);
    if (user) req.user = user;
  } catch {
    // 静默忽略
  }
  next();
}

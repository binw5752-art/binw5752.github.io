import { Router } from "express";
import { register, login, AuthError } from "../services/auth";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { db } from "../services/db";
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
} from "../../shared/types";

const router = Router();

/**
 * POST /api/auth/register
 */
router.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as RegisterRequest;
    const result = await register(body);
    res.status(201).json(result as AuthResponse);
  }),
);

/**
 * POST /api/auth/login
 */
router.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as LoginRequest;
    const result = await login(body);
    res.json(result);
  }),
);

/**
 * GET /api/auth/me
 * 需要登录
 */
router.get(
  "/auth/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new AuthError(401, "unauthorized", "请先登录");
    res.json(req.user);
  }),
);

/**
 * GET /api/auth/check?account=xxx
 * 检查账号是否存在（用于邀请输入框实时校验）
 */
router.get("/auth/check", (req, res) => {
  const account = (req.query.account as string ?? "").trim();
  if (!account) {
    return res.json({ exists: false });
  }
  const lower = account.toLowerCase();
  const found = db().users.some(
    (u) => u.email === lower || u.username === account,
  );
  res.json({ exists: Boolean(found) });
});

export default router;

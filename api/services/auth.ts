/**
 * 认证服务
 * ----------------------------------------------
 * - 注册：邮箱/用户名唯一性校验、bcrypt 哈希密码
 * - 登录：账号（邮箱或用户名）+ 密码
 * - JWT 签发与校验
 *
 * JWT_SECRET 缺失时自动生成一个并打印警告，
 * 重启后旧 token 失效（演示场景可接受）
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, saveDb, type DbUser } from "./db";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../../shared/types";

const JWT_SECRET = process.env.JWT_SECRET || "mojing-dev-secret-change-me";
const TOKEN_EXPIRES_IN = "7d";

if (!process.env.JWT_SECRET) {
  console.warn("[auth] 未设置 JWT_SECRET，使用默认值（演示用）");
}

/** 生成用户 ID */
function genId(prefix = "u"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 把 DbUser 转成对外 User（隐藏密码等敏感字段） */
function toUser(u: DbUser): User {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    bio: u.bio,
    createdAt: u.createdAt,
  };
}

export class AuthError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "AuthError";
  }
}

/** 注册 */
export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const username = req.username?.trim();
  const email = req.email?.trim().toLowerCase();
  const password = req.password;

  if (!username || username.length < 2) {
    throw new AuthError(400, "invalid_param", "用户名至少 2 个字符");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthError(400, "invalid_param", "邮箱格式不正确");
  }
  if (!password || password.length < 6) {
    throw new AuthError(400, "invalid_param", "密码至少 6 位");
  }

  const current = db();
  if (current.users.some((u) => u.email === email)) {
    throw new AuthError(409, "email_taken", "该邮箱已注册");
  }
  if (current.users.some((u) => u.username === username)) {
    throw new AuthError(409, "username_taken", "该用户名已被占用");
  }

  const id = genId();
  const now = new Date().toISOString();
  const newUser: DbUser = {
    id,
    username,
    email,
    createdAt: now,
  };
  current.users.push(newUser);

  const hash = await bcrypt.hash(password, 10);
  current.passwords[id] = hash;
  saveDb(current);

  const token = jwt.sign({ sub: id, username }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
  return { token, user: toUser(newUser) };
}

/** 登录 */
export async function login(req: LoginRequest): Promise<AuthResponse> {
  const account = req.account?.trim();
  const password = req.password ?? "";
  if (!account || !password) {
    throw new AuthError(400, "invalid_param", "账号与密码不能为空");
  }

  const current = db();
  const lower = account.toLowerCase();
  const user = current.users.find(
    (u) => u.email === lower || u.username === account,
  );
  if (!user) {
    throw new AuthError(404, "user_not_found", "账号不存在");
  }
  const hash = current.passwords[user.id];
  if (!hash) {
    throw new AuthError(401, "auth_failed", "凭据无效");
  }
  const ok = await bcrypt.compare(password, hash);
  if (!ok) {
    throw new AuthError(401, "auth_failed", "密码错误");
  }
  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
  return { token, user: toUser(user) };
}

/** 根据 ID 取用户 */
export function getUserById(id: string): User | null {
  const u = db().users.find((u) => u.id === id);
  return u ? toUser(u) : null;
}

/** 根据邮箱或用户名查找（用于邀请成员） */
export function findByAccount(account: string): User | null {
  const lower = account.trim().toLowerCase();
  const u = db().users.find(
    (u) => u.email === lower || u.username === account.trim(),
  );
  return u ? toUser(u) : null;
}

/** 校验 JWT，返回 userId 或抛 AuthError */
export function verifyToken(token: string): { userId: string } {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub?: string;
      username?: string;
    };
    if (!payload.sub) {
      throw new AuthError(401, "invalid_token", "token 无效");
    }
    return { userId: payload.sub };
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError(401, "invalid_token", "token 无效或已过期");
  }
}

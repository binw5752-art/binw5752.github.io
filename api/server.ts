import "dotenv/config";
import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import worksRouter from "./routes/works";
import aiRouter from "./routes/ai";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import settingsRouter from "./routes/settings";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { defaultProvider } from "./services/llm";
import { defaultImageProvider } from "./services/image";
import { loadDb } from "./services/db";

const app = express();
const PORT = Number(process.env.PORT ?? 8787);

// 启动时预加载数据库（不存在则初始化）
loadDb();

// CORS：生产环境从 CORS_ORIGINS 读取白名单
const corsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors(
    corsOrigins.length > 0
      ? { origin: corsOrigins, credentials: true }
      : undefined,
  ),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, _res, next) => {
  console.log(`[api] ${req.method} ${req.path}`);
  next();
});

// API 信息（仅在开发模式，生产模式由前端首页接管 / 路径）
app.get("/api", (_req, res) => {
  res.json({
    name: "墨境 MOJING API",
    version: "0.1.0",
    docs: "/api/health",
  });
});

app.use("/api", authRouter);
app.use("/api", projectsRouter);
app.use("/api", settingsRouter);
app.use("/api", worksRouter);
app.use("/api", aiRouter);

// 生产环境托管前端静态文件（dist/）
// 这样部署到 Render 单服务时，前端和后端用同一个域名
const DIST_DIR = resolve(process.cwd(), "dist");
if (process.env.NODE_ENV === "production" && existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // SPA fallback：非 /api 路径都返回 index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(resolve(DIST_DIR, "index.html"));
  });
  console.log(`[server] 托管前端静态文件: ${DIST_DIR}`);
} else {
  // 开发模式：根路径返回欢迎信息
  app.get("/", (_req, res) => {
    res.json({
      name: "墨境 MOJING API",
      version: "0.1.0",
      docs: "/api/health",
      mode: "development",
    });
  });
}

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

// 启动
app.listen(PORT, () => {
  console.log("\n========================================");
  console.log("  墨境 MOJING API Server");
  console.log("========================================");
  console.log(`  ➜  Listening:  http://localhost:${PORT}`);
  console.log(`  ➜  LLM:        ${defaultProvider().name}`);
  console.log(`  ➜  Image:      ${defaultImageProvider().name}`);
  console.log(`  ➜  Health:     http://localhost:${PORT}/api/health`);
  console.log(`  ➜  Auth:       /api/auth/register, /api/auth/login`);
  console.log(`  ➜  Projects:   /api/projects`);
  console.log(`  ➜  Settings:   /api/settings`);
  console.log("========================================\n");
});

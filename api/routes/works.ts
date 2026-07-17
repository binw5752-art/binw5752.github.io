import { Router } from "express";
import { works, getWorkById, getRelatedWorks, getRankedWorks, categories, platformStatsData } from "../data/works";
import type { WorkCategory } from "../../shared/types";

const router = Router();

/**
 * GET /api/works
 * 查询参数：
 *   category - 按分类筛选（可选）
 *   q       - 搜索关键词（可选）
 */
router.get("/works", (req, res) => {
  const { category, q } = req.query as {
    category?: string;
    q?: string;
  };

  let list = works;
  // "全部" 视为不筛选；其余按分类精确匹配
  if (category && category !== "全部") {
    list = list.filter((w) => w.category === (category as WorkCategory));
  }
  if (q && q.trim()) {
    const keyword = q.trim().toLowerCase();
    list = list.filter(
      (w) =>
        w.title.toLowerCase().includes(keyword) ||
        w.author.toLowerCase().includes(keyword) ||
        w.synopsis.toLowerCase().includes(keyword) ||
        w.tags.some((t) => t.toLowerCase().includes(keyword))
    );
  }
  res.json({ items: list, total: list.length });
});

/**
 * GET /api/works/:id
 */
router.get("/works/:id", (req, res) => {
  const work = getWorkById(req.params.id);
  if (!work) {
    return res.status(404).json({
      error: "not_found",
      message: `作品 ${req.params.id} 不存在`,
      status: 404,
    });
  }
  res.json(work);
});

/**
 * GET /api/works/:id/related
 */
router.get("/works/:id/related", (req, res) => {
  const work = getWorkById(req.params.id);
  if (!work) {
    return res.status(404).json({
      error: "not_found",
      message: `作品 ${req.params.id} 不存在`,
      status: 404,
    });
  }
  const limit = Math.min(Number(req.query.limit ?? 6), 12);
  res.json({ items: getRelatedWorks(work, limit) });
});

/**
 * GET /api/ranking?period=day|week|month
 */
router.get("/ranking", (req, res) => {
  const period = (req.query.period as "day" | "week" | "month") ?? "week";
  const validPeriods = ["day", "week", "month"];
  if (!validPeriods.includes(period)) {
    return res.status(400).json({
      error: "invalid_param",
      message: `period 必须是 ${validPeriods.join("/")}`,
      status: 400,
    });
  }
  res.json({ items: getRankedWorks(period), period });
});

/**
 * GET /api/categories
 */
router.get("/categories", (_req, res) => {
  res.json({ items: categories });
});

/**
 * GET /api/stats
 */
router.get("/stats", (_req, res) => {
  res.json(platformStatsData);
});

export default router;

/**
 * 后端作品数据访问层
 * 直接复用前端 mock 数据，真实生产环境应改为从数据库读取
 */
import {
  works as frontWorks,
  getWorkById as frontGetWorkById,
  getRelatedWorks as frontGetRelatedWorks,
  getRankedWorks as frontGetRankedWorks,
  categories,
  platformStats,
} from "@/data/works";
import type { Work, PlatformStats } from "../../shared/types";

// 重新导出（前端 Work 类型与 shared/types 兼容）
export const works: Work[] = frontWorks as unknown as Work[];
export const getWorkById = (id: string): Work | undefined =>
  frontGetWorkById(id) as unknown as Work | undefined;
export const getRelatedWorks = (work: Work, limit = 4): Work[] =>
  frontGetRelatedWorks(
    work as unknown as Parameters<typeof frontGetRelatedWorks>[0],
    limit
  ) as unknown as Work[];
export const getRankedWorks = (period: "day" | "week" | "month"): Work[] =>
  frontGetRankedWorks(period) as unknown as Work[];
export { categories };
export const platformStatsData: PlatformStats = platformStats;

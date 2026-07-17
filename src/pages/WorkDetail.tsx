import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar,
  User,
  Tag,
  Play,
  X,
  BookOpen,
  ArrowLeft,
  Share2,
  Heart,
} from "lucide-react";
import { getWorkById, getRelatedWorks } from "@/data/works";
import { formatCount } from "@/hooks/useCountUp";
import WorkCard from "@/components/shared/WorkCard";
import { cn } from "@/lib/utils";

export default function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const work = id ? getWorkById(id) : undefined;

  const [readerOpen, setReaderOpen] = useState(false);
  const [episodeIdx, setEpisodeIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);

  // 滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 阅读器键盘控制
  useEffect(() => {
    if (!readerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") nextFrame();
      if (e.key === "ArrowLeft") prevFrame();
      if (e.key === "Escape") setReaderOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [readerOpen, frameIdx, episodeIdx]);

  if (!work) {
    return (
      <section className="container py-32 text-center">
        <h1 className="font-serif font-black text-3xl text-paper">作品不存在</h1>
        <p className="mt-4 font-sans text-sm text-paper/60">该作品可能已被作者撤回</p>
        <Link
          to="/library"
          className="mt-8 inline-flex items-center gap-2 bg-cinnabar text-paper font-sans font-bold px-5 py-2.5 border-2 border-paper shadow-comic hover:bg-cinnabar-dark transition-colors"
        >
          ← 返回作品库
        </Link>
      </section>
    );
  }

  const episode = work.episodes[episodeIdx];
  const currentFrame = episode?.frames[frameIdx];
  const totalFrames = episode?.frames.length ?? 0;
  const related = getRelatedWorks(work, 6);

  const openReader = (eIdx: number, fIdx: number = 0) => {
    setEpisodeIdx(eIdx);
    setFrameIdx(fIdx);
    setReaderOpen(true);
  };

  const nextFrame = () => {
    if (!episode) return;
    if (frameIdx < episode.frames.length - 1) {
      setFrameIdx(frameIdx + 1);
    } else if (episodeIdx < work.episodes.length - 1) {
      setEpisodeIdx(episodeIdx + 1);
      setFrameIdx(0);
    }
  };

  const prevFrame = () => {
    if (frameIdx > 0) {
      setFrameIdx(frameIdx - 1);
    } else if (episodeIdx > 0) {
      const prevEp = work.episodes[episodeIdx - 1];
      setEpisodeIdx(episodeIdx - 1);
      setFrameIdx(prevEp.frames.length - 1);
    }
  };

  return (
    <>
      {/* Hero 头部 */}
      <section className="relative">
        {/* 大封面背景 */}
        <div className="absolute inset-0 h-[60vh] overflow-hidden">
          <img
            src={work.cover}
            alt=""
            className="h-full w-full object-cover object-top opacity-30 blur-md scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink to-ink" />
        </div>

        <div className="relative container pt-12 md:pt-20 pb-10">
          <Link
            to="/library"
            className="inline-flex items-center gap-1 font-sans text-xs text-paper/60 hover:text-cinnabar mb-8 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            返回作品库
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
            {/* 封面卡 */}
            <div className="mx-auto md:mx-0">
              <div className="relative border-2 border-paper shadow-comic-lg overflow-hidden bg-ink-soft">
                <img
                  src={work.cover}
                  alt={work.title}
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 ring-2 ring-inset ring-paper/20" />
                {/* 角标 */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center bg-cinnabar text-paper px-2 py-0.5 border border-paper font-sans text-[10px] font-bold tracking-wider">
                    {work.category}
                  </span>
                </div>
                {work.trending === "up" && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center bg-gold text-ink px-2 py-0.5 border border-paper font-mono text-[10px] font-bold">
                      🔥 HOT
                    </span>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <button
                onClick={() => openReader(0)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-cinnabar text-paper font-sans font-bold px-5 py-3 border-2 border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark transition-all"
              >
                <Play className="h-4 w-4" fill="currentColor" />
                开始阅读
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="inline-flex items-center justify-center gap-1.5 bg-transparent text-paper font-sans font-bold text-xs px-3 py-2 border-2 border-paper/40 hover:border-paper hover:bg-paper/10 transition-all">
                  <Heart className="h-3.5 w-3.5" />
                  收藏
                </button>
                <button className="inline-flex items-center justify-center gap-1.5 bg-transparent text-paper font-sans font-bold text-xs px-3 py-2 border-2 border-paper/40 hover:border-paper hover:bg-paper/10 transition-all">
                  <Share2 className="h-3.5 w-3.5" />
                  分享
                </button>
              </div>
            </div>

            {/* 信息 */}
            <div className="min-w-0">
              <h1 className="font-serif font-black text-4xl md:text-6xl text-paper leading-tight">
                {work.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-xs text-paper/60">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-celadon" />
                  {work.author}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-celadon" />
                  {work.createdAt}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-cinnabar" />
                  热度 <span className="font-mono text-cinnabar font-bold">{formatCount(work.heat)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-celadon" />
                  {work.episodes.length} 话
                </span>
              </div>

              <p className="mt-6 font-sans text-sm md:text-base text-paper/80 leading-relaxed">
                {work.synopsis}
              </p>

              {/* 标签 */}
              <div className="mt-6 flex flex-wrap gap-2">
                {work.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-ink-soft border border-ink-line font-sans text-[10px] text-paper/70"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {t}
                  </span>
                ))}
              </div>

              {/* 章节 */}
              <div className="mt-10">
                <h3 className="font-serif font-bold text-lg text-paper mb-4 flex items-center gap-2">
                  <span className="h-px w-6 bg-cinnabar" />
                  章节列表
                </h3>
                <div className="space-y-2">
                  {work.episodes.map((ep, i) => (
                    <button
                      key={ep.id}
                      onClick={() => openReader(i)}
                      className="group w-full flex items-center gap-4 border-2 border-ink-line bg-ink-soft p-3 text-left hover:border-cinnabar hover:shadow-comic-sm transition-all"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-ink border-2 border-paper/40 font-mono font-bold text-sm text-cinnabar group-hover:border-cinnabar transition-colors">
                        {String(ep.index).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-sm text-paper group-hover:text-cinnabar transition-colors">
                          {ep.title}
                        </p>
                        <p className="font-sans text-[10px] text-paper/50 mt-0.5">
                          {ep.frames.length} 帧 · 约 {Math.ceil(ep.frames.length * 0.5)} 分钟
                        </p>
                      </div>
                      <Play className="h-4 w-4 text-paper/40 group-hover:text-cinnabar transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 角色档案 */}
      <section className="container py-16">
        <div className="mb-8">
          <span className="font-mono text-xs tracking-[0.3em] text-celadon uppercase">
            CHARACTERS
          </span>
          <h2 className="mt-3 font-serif font-black text-3xl text-paper">
            角色档案
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {work.characters.map((c) => (
            <div
              key={c.id}
              className="group relative border-2 border-ink-line bg-ink-soft shadow-comic hover:border-paper hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 h-24 w-24 opacity-30 blur-2xl"
                style={{ background: c.color }}
              />
              <div className="relative flex gap-4 p-5">
                <div className="shrink-0">
                  <div className="h-24 w-24 border-2 border-paper overflow-hidden bg-ink shadow-comic-sm">
                    <img src={c.avatar} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-paper">{c.name}</h3>
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 border"
                      style={{ borderColor: c.color, color: c.color }}
                    >
                      {c.traits[0]}
                    </span>
                  </div>
                  <p className="mt-1.5 font-sans text-xs text-paper/70 leading-relaxed line-clamp-3">
                    {c.bio}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.traits.map((t) => (
                      <span key={t} className="inline-flex items-center px-1.5 py-0.5 bg-ink border border-ink-line font-sans text-[10px] text-paper/60">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 相关推荐 */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="font-mono text-xs tracking-[0.3em] text-celadon uppercase">
              RELATED
            </span>
            <h2 className="mt-3 font-serif font-black text-3xl text-paper">
              你可能也喜欢
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {related.map((w) => (
            <WorkCard key={w.id} work={w} size="sm" />
          ))}
        </div>
      </section>

      {/* 阅读器模态 */}
      <AnimatePresence>
        {readerOpen && currentFrame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-md flex flex-col"
          >
            {/* 顶部栏 */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink-line">
              <div className="min-w-0">
                <p className="font-serif font-bold text-sm text-paper truncate">
                  {work.title} · {episode.title}
                </p>
                <p className="font-mono text-[10px] text-paper/50 mt-0.5">
                  FRAME {frameIdx + 1} / {totalFrames} · EP {episodeIdx + 1} / {work.episodes.length}
                </p>
              </div>
              <button
                onClick={() => setReaderOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center border-2 border-paper text-paper hover:bg-cinnabar hover:border-cinnabar transition-colors"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 主体 */}
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-10 overflow-hidden">
              {/* 上一帧 */}
              <button
                onClick={prevFrame}
                disabled={episodeIdx === 0 && frameIdx === 0}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-12 w-12 items-center justify-center border-2 border-paper text-paper shadow-comic transition-all",
                  episodeIdx === 0 && frameIdx === 0
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-cinnabar hover:border-cinnabar"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* 分镜 */}
              <motion.div
                key={`${episodeIdx}-${frameIdx}`}
                initial={{ opacity: 0, x: 30, rotate: -1 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative max-w-4xl w-full"
              >
                <div className="relative border-2 border-paper shadow-comic-lg overflow-hidden bg-ink">
                  <img
                    src={currentFrame.imageUrl}
                    alt={currentFrame.sceneDesc}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute inset-0 ring-2 ring-inset ring-paper/10" />

                  {/* 对白气泡 */}
                  {currentFrame.dialogue && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="relative inline-block bg-paper text-ink border-2 border-ink px-4 py-2 shadow-comic-sm max-w-full">
                        <p className="font-serif text-sm font-bold">
                          {currentFrame.dialogue}
                        </p>
                        <span className="absolute -top-2 left-6 h-3 w-3 bg-paper border-t-2 border-l-2 border-ink rotate-45" />
                      </div>
                    </div>
                  )}

                  {/* 帧编号 */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center bg-ink/80 backdrop-blur border border-paper/40 px-2 py-0.5 font-mono text-[10px] text-paper">
                      {String(frameIdx + 1).padStart(2, "0")} / {String(totalFrames).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* 场景描述 */}
                <p className="mt-4 font-sans text-xs text-paper/60 text-center italic">
                  ▸ {currentFrame.sceneDesc}
                </p>
              </motion.div>

              {/* 下一帧 */}
              <button
                onClick={nextFrame}
                disabled={episodeIdx === work.episodes.length - 1 && frameIdx === totalFrames - 1}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-12 w-12 items-center justify-center border-2 border-paper text-paper shadow-comic transition-all",
                  episodeIdx === work.episodes.length - 1 && frameIdx === totalFrames - 1
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-cinnabar hover:border-cinnabar"
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* 底部进度条 */}
            <div className="px-6 py-4 border-t-2 border-ink-line">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-paper/50">
                  {String(frameIdx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 h-1.5 bg-ink overflow-hidden border border-ink-line">
                  <div
                    className="h-full bg-cinnabar transition-all duration-300"
                    style={{ width: `${((frameIdx + 1) / totalFrames) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-paper/50">
                  {String(totalFrames).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10px] text-paper/40 text-center tracking-wider">
                ← → 键翻页 · ESC 关闭
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

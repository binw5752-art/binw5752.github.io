import { useState, type DragEvent } from "react";
import { GripVertical, Plus, Trash2, Pencil } from "lucide-react";
import { useStudioStore } from "@/store/studioStore";
import { frame as frameImg } from "@/lib/image";
import { cn } from "@/lib/utils";

export default function StoryboardStep() {
  const { frames, reorderFrames, setFrames } = useStudioStore();
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const onDragStart = (e: DragEvent, idx: number) => {
    setDragFrom(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: DragEvent, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  };

  const onDrop = (e: DragEvent, idx: number) => {
    e.preventDefault();
    if (dragFrom === null || dragFrom === idx) {
      setDragFrom(null);
      setDragOver(null);
      return;
    }
    reorderFrames(dragFrom, idx);
    setDragFrom(null);
    setDragOver(null);
  };

  const onDragEnd = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  const addFrame = () => {
    const prompts = [
      ["寂静的雨夜", "压抑沉郁"],
      ["突如其来的脚步声", "悬疑紧张"],
      ["主角转身望向窗外的天空", "决意沉静"],
      ["特写：紧握的双拳", "情绪爆发"],
    ];
    const [scene, mood] = prompts[Math.floor(Math.random() * prompts.length)];
    const newFrame = {
      id: `sf-new-${Date.now()}`,
      index: frames.length + 1,
      imageUrl: frameImg(scene, mood, "landscape_4_3"),
      dialogue: "（新增分镜）",
      sceneDesc: scene,
    };
    setFrames([...frames, newFrame]);
  };

  const removeFrame = (id: string) => {
    setFrames(frames.filter((f) => f.id !== id).map((f, i) => ({ ...f, index: i + 1 })));
  };

  return (
    <div className="space-y-5">
      {/* 顶部条 */}
      <div className="flex items-center justify-between border-2 border-ink-line bg-ink-soft shadow-comic p-4">
        <div>
          <h3 className="font-serif font-bold text-base text-paper">分镜编辑器</h3>
          <p className="font-sans text-xs text-paper/50 mt-0.5">
            拖拽卡片调整顺序 · 当前 {frames.length} 帧
          </p>
        </div>
        <button
          onClick={addFrame}
          className="inline-flex items-center gap-2 bg-celadon text-ink font-sans font-bold px-4 py-2 border-2 border-paper shadow-comic-sm hover:shadow-comic hover:bg-celadon-soft transition-all"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          新增分镜
        </button>
      </div>

      {/* 分镜网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {frames.map((f, idx) => {
          const isDragging = dragFrom === idx;
          const isDragOver = dragOver === idx && dragFrom !== idx;
          return (
            <div
              key={f.id}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={(e) => onDrop(e, idx)}
              onDragEnd={onDragEnd}
              className={cn(
                "group relative border-2 bg-ink-soft shadow-comic transition-all cursor-grab active:cursor-grabbing",
                isDragging
                  ? "border-celadon opacity-50 scale-95"
                  : isDragOver
                  ? "border-cinnabar border-dashed"
                  : "border-ink-line hover:border-paper hover:-translate-y-1"
              )}
            >
              {/* 编号 + 拖拽手柄 */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                <span className="inline-flex h-7 w-7 items-center justify-center bg-cinnabar text-paper border border-paper font-mono text-xs font-bold shadow-comic-sm">
                  {f.index}
                </span>
              </div>
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="inline-flex h-7 w-7 items-center justify-center bg-ink border border-paper/40 text-paper hover:border-paper"
                  aria-label="编辑"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => removeFrame(f.id)}
                  className="inline-flex h-7 w-7 items-center justify-center bg-ink border border-cinnabar/40 text-cinnabar hover:border-cinnabar hover:bg-cinnabar hover:text-paper transition-colors"
                  aria-label="删除"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-2 z-10 text-paper/40 group-hover:text-paper cursor-grip opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* 画面 */}
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                <img
                  src={f.imageUrl}
                  alt={f.sceneDesc}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 ring-2 ring-inset ring-paper/10" />
              </div>

              {/* 信息 */}
              <div className="p-3 space-y-2">
                <p className="font-sans text-xs text-paper/70 leading-relaxed line-clamp-2">
                  {f.sceneDesc}
                </p>
                {f.dialogue && (
                  <div className="border-l-2 border-celadon pl-2">
                    <p className="font-sans text-xs text-celadon italic">
                      「{f.dialogue}」
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 添加占位卡 */}
        <button
          onClick={addFrame}
          className="aspect-[4/3] md:aspect-auto flex flex-col items-center justify-center border-2 border-dashed border-ink-line hover:border-celadon hover:bg-celadon/5 transition-all text-paper/40 hover:text-celadon"
        >
          <Plus className="h-8 w-8 mb-2" />
          <span className="font-sans text-xs">添加分镜</span>
        </button>
      </div>
    </div>
  );
}

import { Feather } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="container py-32 md:py-48">
      <div className="relative max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="inline-flex h-10 w-10 items-center justify-center bg-cinnabar text-paper border-2 border-paper shadow-comic rotate-[-6deg]">
            <Feather className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-serif font-black text-xl text-paper">墨境</span>
        </div>

        <h1 className="font-serif font-black text-[120px] md:text-[200px] leading-none text-cinnabar">
          404
        </h1>
        <p className="mt-4 font-serif text-2xl md:text-3xl text-paper">
          这一页墨，尚未着色
        </p>
        <p className="mt-3 font-sans text-sm text-paper/60">
          你访问的页面不存在，或已被作者撤回。
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-cinnabar text-paper font-sans text-sm font-bold px-6 py-3 border-2 border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark transition-all"
          >
            ← 返回首页
          </Link>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 bg-transparent text-paper font-sans text-sm font-bold px-6 py-3 border-2 border-paper/40 hover:border-paper transition-all"
          >
            浏览作品库
          </Link>
        </div>
      </div>
    </section>
  );
}

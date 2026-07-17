import { Link } from "react-router-dom";
import { Feather, Github, Twitter, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t-2 border-ink-line bg-ink-deep">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center bg-cinnabar text-paper border-2 border-paper shadow-comic rotate-[-6deg]">
                <Feather className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-serif font-black text-xl text-paper tracking-wider">
                  墨境
                </span>
                <span className="font-mono text-[10px] text-celadon tracking-[0.3em]">
                  MOJING
                </span>
              </div>
            </div>
            <p className="font-sans text-sm text-paper/60 leading-relaxed max-w-md">
              从一句灵感到一部漫剧。AI 一体化创作平台，让每个故事都能被画出来。
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Send, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center border-2 border-ink-line text-paper/70 hover:border-cinnabar hover:text-cinnabar transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif font-bold text-paper mb-4 text-sm tracking-widest">
              产品
            </h4>
            <ul className="space-y-3 font-sans text-sm text-paper/60">
              <li><Link to="/studio" className="hover:text-cinnabar transition-colors">创作工作台</Link></li>
              <li><Link to="/library" className="hover:text-cinnabar transition-colors">作品库</Link></li>
              <li><Link to="/pricing" className="hover:text-cinnabar transition-colors">定价方案</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-paper mb-4 text-sm tracking-widest">
              关于
            </h4>
            <ul className="space-y-3 font-sans text-sm text-paper/60">
              <li><a href="#" className="hover:text-cinnabar transition-colors">用户协议</a></li>
              <li><a href="#" className="hover:text-cinnabar transition-colors">隐私政策</a></li>
              <li><a href="#" className="hover:text-cinnabar transition-colors">商务合作</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ink-line flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-paper/40 tracking-wider">
            © 2026 MOJING · 墨境. ALL RIGHTS RESERVED.
          </p>
          <p className="font-mono text-xs text-celadon/60 tracking-wider">
            MADE WITH INK &amp; NEON
          </p>
        </div>
      </div>
    </footer>
  );
}

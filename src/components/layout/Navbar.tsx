import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Feather, LogOut, FolderPlus, Folder, ChevronDown, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "首页", to: "/" },
  { label: "我的项目", to: "/projects", auth: true },
  { label: "作品库", to: "/library" },
  { label: "定价", to: "/pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // 点击外部关闭下拉
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleStartCreate = () => {
    if (user) navigate("/projects");
    else navigate("/login?redirect=/projects");
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const visibleNavItems = navItems.filter(
    (item) => !("auth" in item && item.auth) || user,
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-ink/85 backdrop-blur-md border-b-2 border-ink-line"
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <span className="relative inline-flex h-9 w-9 items-center justify-center bg-cinnabar text-paper border-2 border-paper shadow-comic rotate-[-6deg] group-hover:rotate-0 transition-transform">
            <Feather className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif font-black text-xl text-paper tracking-wider">
              墨境
            </span>
            <span className="font-mono text-[10px] text-celadon tracking-[0.3em]">
              MOJING
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {visibleNavItems.map((item) => {
            const active =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "underline-grow font-sans text-sm font-medium tracking-wide transition-colors",
                  active ? "text-cinnabar is-active" : "text-paper/80 hover:text-paper"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA / User */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 border-2 border-paper/30 hover:border-paper bg-ink-soft px-3 py-2 transition-all"
              >
                <span
                  className="inline-flex h-7 w-7 items-center justify-center bg-cinnabar text-paper font-serif font-black text-sm border-2 border-paper"
                  aria-hidden
                >
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-sans text-xs text-paper font-medium max-w-[100px] truncate">
                  {user.username}
                </span>
                <ChevronDown className={cn("h-3 w-3 text-paper/60 transition-transform", menuOpen && "rotate-180")} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 border-2 border-ink-line bg-ink shadow-comic-lg py-1">
                  <div className="px-4 py-3 border-b-2 border-ink-line">
                    <p className="font-sans text-xs text-paper/60">已登录</p>
                    <p className="font-sans text-sm text-paper font-bold truncate">
                      {user.username}
                    </p>
                    <p className="font-mono text-[10px] text-paper/50 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/projects"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-paper hover:bg-ink-soft"
                  >
                    <Folder className="h-4 w-4" /> 我的项目
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/projects?new=1");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-paper hover:bg-ink-soft"
                  >
                    <FolderPlus className="h-4 w-4" /> 创建新项目
                  </button>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-paper hover:bg-ink-soft border-t-2 border-ink-line"
                  >
                    <SettingsIcon className="h-4 w-4" /> 设置 · API 接入
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-cinnabar border-t-2 border-ink-line hover:bg-cinnabar/10"
                  >
                    <LogOut className="h-4 w-4" /> 退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="font-sans text-sm text-paper/80 hover:text-paper transition-colors px-2"
              >
                登录
              </Link>
              <button
                onClick={handleStartCreate}
                className="inline-flex items-center gap-2 bg-cinnabar text-paper font-sans text-sm font-bold px-5 py-2.5 border-2 border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark transition-all"
              >
                <Feather className="h-4 w-4" strokeWidth={2.5} />
                开始创作
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center border-2 border-paper text-paper"
          onClick={() => setOpen((v) => !v)}
          aria-label="切换菜单"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-ink/95 backdrop-blur-md border-t-2 border-ink-line">
          <nav className="container flex flex-col py-4 gap-1">
            {visibleNavItems.map((item) => {
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "py-3 px-4 font-sans text-sm font-medium border-l-2 transition-all",
                    active
                      ? "border-cinnabar text-cinnabar bg-ink-soft"
                      : "border-transparent text-paper/80 hover:text-paper hover:border-paper/40"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <>
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="py-3 px-4 font-sans text-sm font-medium border-l-2 transition-all border-transparent text-paper/80 hover:text-paper hover:border-paper/40"
                >
                  设置 · API 接入
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-3 mx-4 inline-flex items-center justify-center gap-2 border-2 border-cinnabar text-cinnabar font-sans text-sm font-bold px-5 py-3"
                >
                  <LogOut className="h-4 w-4" /> 退出登录
                </button>
              </>
            ) : (
              <button
                onClick={handleStartCreate}
                className="mt-3 mx-4 inline-flex items-center justify-center gap-2 bg-cinnabar text-paper font-sans text-sm font-bold px-5 py-3 border-2 border-paper shadow-comic"
              >
                <Feather className="h-4 w-4" strokeWidth={2.5} />
                开始创作
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/**
 * 项目成员管理面板
 * - 列出所有成员、角色
 * - Owner：邀请、改角色、移除成员
 * - 普通成员：可查看，可自退
 */
import { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Trash2,
  Loader2,
  AlertTriangle,
  Crown,
  Pencil,
  Eye,
  Shield,
  Check,
} from "lucide-react";
import api, { ApiError } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";
import type { Project, ProjectRole } from "@/types";

const ROLE_META: Record<
  ProjectRole,
  { label: string; color: string; icon: React.ReactNode; desc: string }
> = {
  owner: {
    label: "Owner",
    color: "cinnabar",
    icon: <Crown className="h-3 w-3" />,
    desc: "拥有者 · 全部权限",
  },
  editor: {
    label: "Editor",
    color: "celadon",
    icon: <Pencil className="h-3 w-3" />,
    desc: "编辑者 · 可改项目内容",
  },
  viewer: {
    label: "Viewer",
    color: "gold",
    icon: <Eye className="h-3 w-3" />,
    desc: "查看者 · 仅可查看",
  },
};

export default function MembersPanel({
  project,
  onClose,
  onUpdated,
}: {
  project: Project;
  onClose: () => void;
  onUpdated: (p: Project) => void;
}) {
  const { user } = useAuth();
  const isOwner = project.ownerId === user?.id;

  const [inviteAccount, setInviteAccount] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>("editor");
  const [checking, setChecking] = useState(false);
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 防抖校验账号是否存在
  useEffect(() => {
    const v = inviteAccount.trim();
    if (!v) {
      setAccountExists(null);
      return;
    }
    setChecking(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.checkAccount(v);
        setAccountExists(res.exists);
      } catch {
        setAccountExists(null);
      } finally {
        setChecking(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [inviteAccount]);

  const handleInvite = async () => {
    setError(null);
    if (!inviteAccount.trim()) {
      setError("请输入要邀请的用户名或邮箱");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await api.inviteMember(project.id, {
        account: inviteAccount.trim(),
        role: inviteRole,
      });
      onUpdated(updated);
      setInviteAccount("");
      setAccountExists(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "邀请失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (userId: string, role: ProjectRole) => {
    try {
      const updated = await api.updateMemberRole(project.id, userId, { role });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "更新失败");
    }
  };

  const handleRemove = async (userId: string, username: string) => {
    if (!confirm(`确定将「${username}」移出项目？`)) return;
    try {
      const updated = await api.removeMember(project.id, userId);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "移除失败");
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    if (!confirm("确定退出该项目？退出后将不再能访问。")) return;
    try {
      // 自退
      await api.removeMember(project.id, user.id);
      onClose();
      // 退出后跳到列表
      window.location.href = "/projects";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "退出失败");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-deep/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-paper bg-ink-soft shadow-comic-lg">
        {/* 头部 */}
        <div className="sticky top-0 bg-ink-soft border-b-2 border-ink-line p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="font-serif font-black text-lg text-paper">项目成员</h3>
            <p className="font-mono text-[10px] text-paper/50 mt-0.5">
              {project.name} · {project.members.length} 位成员
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center border-2 border-ink-line hover:border-cinnabar hover:text-cinnabar text-paper"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {error && (
            <div className="flex items-start gap-2 border-2 border-cinnabar bg-cinnabar/10 p-3">
              <AlertTriangle className="h-4 w-4 text-cinnabar flex-shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-cinnabar">{error}</p>
            </div>
          )}

          {/* 邀请区（仅 Owner） */}
          {isOwner ? (
            <div className="border-2 border-ink-line bg-ink p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="h-4 w-4 text-celadon" />
                <h4 className="font-serif font-bold text-sm text-paper">邀请协作者</h4>
              </div>
              <p className="font-sans text-[11px] text-paper/50 mb-3">
                输入对方的<strong className="text-paper">用户名或邮箱</strong>，
                对方需已注册墨境账号
              </p>
              <input
                type="text"
                value={inviteAccount}
                onChange={(e) => setInviteAccount(e.target.value)}
                placeholder="例如：墨白 或 mochi@example.com"
                className="w-full bg-ink-soft border-2 border-ink-line px-3 py-2 font-sans text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-celadon mb-2"
              />
              {/* 校验提示 */}
              {inviteAccount.trim() && (
                <div className="font-mono text-[10px] mb-2 flex items-center gap-1">
                  {checking ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-paper/50" />
                      <span className="text-paper/50">检查中…</span>
                    </>
                  ) : accountExists ? (
                    <>
                      <Check className="h-3 w-3 text-celadon" />
                      <span className="text-celadon">账号存在，可邀请</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 text-gold" />
                      <span className="text-gold">未找到该账号</span>
                    </>
                  )}
                </div>
              )}

              {/* 角色选择 */}
              <div className="mb-3">
                <span className="block font-mono text-[10px] text-paper/60 mb-2">
                  ▸ 分配角色
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["editor", "viewer"] as ProjectRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setInviteRole(r)}
                      className={cn(
                        "flex items-center justify-center gap-2 font-sans text-xs px-3 py-2 border-2 transition-all",
                        inviteRole === r
                          ? r === "editor"
                            ? "bg-celadon text-ink border-paper"
                            : "bg-gold text-ink border-paper"
                          : "bg-ink-soft text-paper/70 border-ink-line hover:border-paper/40",
                      )}
                    >
                      {ROLE_META[r].icon}
                      {ROLE_META[r].label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleInvite}
                disabled={submitting || !inviteAccount.trim()}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 font-sans text-sm font-bold px-4 py-2.5 border-2 transition-all",
                  submitting || !inviteAccount.trim()
                    ? "bg-ink-soft text-paper/50 border-ink-line cursor-not-allowed"
                    : "bg-celadon text-ink border-paper shadow-comic hover:bg-celadon-soft",
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    邀请中…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    发送邀请
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="border-2 border-ink-line bg-ink p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold" />
                <p className="font-sans text-xs text-paper/70">
                  你是项目协作者。仅 Owner 可邀请或管理成员。
                </p>
              </div>
            </div>
          )}

          {/* 成员列表 */}
          <div>
            <h4 className="font-serif font-bold text-sm text-paper mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-cinnabar" />
              成员列表
            </h4>
            <div className="space-y-2">
              {project.members.map((m) => {
                const isMe = m.userId === user?.id;
                const meta = ROLE_META[m.role];
                return (
                  <div
                    key={m.userId}
                    className="flex items-center justify-between gap-3 border-2 border-ink-line bg-ink p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex h-9 w-9 items-center justify-center bg-cinnabar text-paper font-serif font-black text-sm border-2 border-paper flex-shrink-0">
                        {m.username.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-sm text-paper font-bold truncate">
                            {m.username}
                          </span>
                          {isMe && (
                            <span className="font-mono text-[9px] text-celadon border border-celadon/40 px-1 py-0.5">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-paper/50">
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {m.role === "owner" ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-cinnabar border border-cinnabar/40 px-2 py-1">
                          {meta.icon}
                          {meta.label}
                        </span>
                      ) : isOwner ? (
                        <>
                          {/* Owner 可改角色 + 移除 */}
                          <select
                            value={m.role}
                            onChange={(e) =>
                              handleChangeRole(
                                m.userId,
                                e.target.value as ProjectRole,
                              )
                            }
                            className="bg-ink-soft border-2 border-ink-line text-paper text-xs px-2 py-1 focus:outline-none focus:border-celadon"
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            onClick={() => handleRemove(m.userId, m.username)}
                            className="inline-flex h-7 w-7 items-center justify-center border-2 border-ink-line text-paper/60 hover:border-cinnabar hover:text-cinnabar"
                            aria-label="移除成员"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      ) : isMe ? (
                        <button
                          onClick={handleLeave}
                          className="font-mono text-[10px] border-2 border-cinnabar text-cinnabar px-2 py-1 hover:bg-cinnabar/10"
                        >
                          退出项目
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-paper/60 border border-ink-line px-2 py-1">
                          {meta.icon}
                          {meta.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

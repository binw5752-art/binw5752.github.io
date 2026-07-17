/**
 * 项目服务
 * ----------------------------------------------
 * - CRUD：创建、查（我的/参与的）、详情、更新、删除
 * - 成员管理：邀请、移除、改角色
 * - Owner 不可被移除；只有 Owner/Editor 可修改项目内容
 */
import { db, saveDb } from "./db";
import type { DbProject, DbMember } from "./db";
import type {
  CreateProjectRequest,
  Project,
  ProjectMember,
  ProjectRole,
  UpdateProjectRequest,
  InviteMemberRequest,
} from "../../shared/types";

export class ProjectError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ProjectError";
  }
}

function genId(prefix = "p"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** DbProject → 对外 Project（成员需附带 username/avatar） */
function toProject(p: DbProject): Project {
  const members: ProjectMember[] = p.members.map((m) => {
    const u = db().users.find((u) => u.id === m.userId);
    return {
      userId: m.userId,
      username: u?.username ?? "(已删除)",
      avatar: u?.avatar,
      role: m.role,
      joinedAt: m.joinedAt,
    };
  });
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    cover: p.cover,
    style: p.style,
    visibility: p.visibility,
    ownerId: p.ownerId,
    members,
    currentStep: p.currentStep,
    script: p.script,
    frames: p.frames as Project["frames"],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/** 列出我参与的项目 */
export function listMyProjects(userId: string): Project[] {
  return db()
    .projects.filter((p) => p.members.some((m) => m.userId === userId))
    .map(toProject);
}

/** 获取单个项目（参与成员可见） */
export function getProject(projectId: string, userId: string): Project {
  const p = db().projects.find((p) => p.id === projectId);
  if (!p) throw new ProjectError(404, "not_found", "项目不存在");
  const isMember = p.members.some((m) => m.userId === userId);
  if (!isMember && p.visibility !== "public") {
    throw new ProjectError(403, "forbidden", "无权访问该项目");
  }
  return toProject(p);
}

/** 创建项目 */
export function createProject(
  req: CreateProjectRequest,
  ownerId: string,
): Project {
  const name = req.name?.trim();
  if (!name || name.length < 1) {
    throw new ProjectError(400, "invalid_param", "项目名称不能为空");
  }
  const now = new Date().toISOString();
  const id = genId();
  const newProject: DbProject = {
    id,
    name,
    description: req.description?.trim() ?? "",
    style: req.style,
    visibility: req.visibility ?? "private",
    ownerId,
    members: [
      {
        userId: ownerId,
        role: "owner",
        joinedAt: now,
      },
    ],
    currentStep: "script",
    createdAt: now,
    updatedAt: now,
  };
  const current = db();
  current.projects.push(newProject);
  saveDb(current);
  return toProject(newProject);
}

/** 更新项目（仅 Owner/Editor 可改） */
export function updateProject(
  projectId: string,
  userId: string,
  patch: UpdateProjectRequest,
): Project {
  const current = db();
  const p = current.projects.find((p) => p.id === projectId);
  if (!p) throw new ProjectError(404, "not_found", "项目不存在");
  const me = p.members.find((m) => m.userId === userId);
  if (!me || (me.role !== "owner" && me.role !== "editor")) {
    throw new ProjectError(403, "forbidden", "需要 Editor 或 Owner 权限");
  }
  if (patch.name !== undefined) p.name = patch.name.trim();
  if (patch.description !== undefined) p.description = patch.description;
  if (patch.style !== undefined) p.style = patch.style;
  if (patch.visibility !== undefined) p.visibility = patch.visibility;
  if (patch.currentStep !== undefined) p.currentStep = patch.currentStep;
  if (patch.script !== undefined) p.script = patch.script;
  if (patch.frames !== undefined) p.frames = patch.frames as unknown[];
  p.updatedAt = new Date().toISOString();
  saveDb(current);
  return toProject(p);
}

/** 删除项目（仅 Owner 可删） */
export function deleteProject(projectId: string, userId: string): void {
  const current = db();
  const p = current.projects.find((p) => p.id === projectId);
  if (!p) throw new ProjectError(404, "not_found", "项目不存在");
  if (p.ownerId !== userId) {
    throw new ProjectError(403, "forbidden", "仅 Owner 可删除项目");
  }
  current.projects = current.projects.filter((p) => p.id !== projectId);
  saveDb(current);
}

/** 邀请成员（仅 Owner 可邀请） */
export function inviteMember(
  projectId: string,
  ownerId: string,
  req: InviteMemberRequest,
): Project {
  const current = db();
  const p = current.projects.find((p) => p.id === projectId);
  if (!p) throw new ProjectError(404, "not_found", "项目不存在");
  if (p.ownerId !== ownerId) {
    throw new ProjectError(403, "forbidden", "仅 Owner 可邀请成员");
  }
  const target = current.users.find(
    (u) =>
      u.email === req.account.trim().toLowerCase() ||
      u.username === req.account.trim(),
  );
  if (!target) {
    throw new ProjectError(404, "user_not_found", "用户不存在，请确认账号或邮箱");
  }
  if (p.members.some((m) => m.userId === target.id)) {
    throw new ProjectError(409, "already_member", "该用户已是项目成员");
  }
  const newMember: DbMember = {
    userId: target.id,
    role: req.role ?? "editor",
    joinedAt: new Date().toISOString(),
  };
  p.members.push(newMember);
  p.updatedAt = new Date().toISOString();
  saveDb(current);
  return toProject(p);
}

/** 改成员角色（仅 Owner 可改） */
export function updateMemberRole(
  projectId: string,
  ownerId: string,
  targetUserId: string,
  role: ProjectRole,
): Project {
  const current = db();
  const p = current.projects.find((p) => p.id === projectId);
  if (!p) throw new ProjectError(404, "not_found", "项目不存在");
  if (p.ownerId !== ownerId) {
    throw new ProjectError(403, "forbidden", "仅 Owner 可调整角色");
  }
  if (targetUserId === ownerId) {
    throw new ProjectError(400, "invalid_param", "不能修改 Owner 角色");
  }
  const m = p.members.find((m) => m.userId === targetUserId);
  if (!m) {
    throw new ProjectError(404, "member_not_found", "该用户不是项目成员");
  }
  if (role === "owner") {
    throw new ProjectError(400, "invalid_param", "不能将成员提升为 Owner");
  }
  m.role = role;
  p.updatedAt = new Date().toISOString();
  saveDb(current);
  return toProject(p);
}

/** 移除成员（Owner 不可被移除；Owner 可移除他人；成员可自退） */
export function removeMember(
  projectId: string,
  userId: string,
  targetUserId: string,
): Project {
  const current = db();
  const p = current.projects.find((p) => p.id === projectId);
  if (!p) throw new ProjectError(404, "not_found", "项目不存在");
  const target = p.members.find((m) => m.userId === targetUserId);
  if (!target) {
    throw new ProjectError(404, "member_not_found", "该用户不是项目成员");
  }
  if (target.role === "owner") {
    throw new ProjectError(400, "invalid_param", "不能移除 Owner");
  }
  // 自己可退；否则必须是 Owner
  if (targetUserId !== userId && p.ownerId !== userId) {
    throw new ProjectError(403, "forbidden", "仅 Owner 可移除他人");
  }
  p.members = p.members.filter((m) => m.userId !== targetUserId);
  p.updatedAt = new Date().toISOString();
  saveDb(current);
  return toProject(p);
}

/** 当前用户在该项目中的角色（无则返回 null） */
export function getMyRole(projectId: string, userId: string): ProjectRole | null {
  const p = db().projects.find((p) => p.id === projectId);
  if (!p) return null;
  const m = p.members.find((m) => m.userId === userId);
  return m?.role ?? null;
}

import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import {
  listMyProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  inviteMember,
  updateMemberRole,
  removeMember,
  ProjectError,
} from "../services/project";
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
} from "../../shared/types";

const router = Router();

/**
 * GET /api/projects
 * 列出我参与的所有项目
 */
router.get(
  "/projects",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new ProjectError(401, "unauthorized", "请先登录");
    res.json({ items: listMyProjects(req.user.id) });
  }),
);

/**
 * POST /api/projects
 * 创建项目
 */
router.post(
  "/projects",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new ProjectError(401, "unauthorized", "请先登录");
    const body = (req.body ?? {}) as CreateProjectRequest;
    const project = createProject(body, req.user.id);
    res.status(201).json(project);
  }),
);

/**
 * GET /api/projects/:id
 */
router.get(
  "/projects/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new ProjectError(401, "unauthorized", "请先登录");
    res.json(getProject(String(req.params.id), req.user.id));
  }),
);

/**
 * PATCH /api/projects/:id
 * 更新项目（仅 Owner/Editor）
 */
router.patch(
  "/projects/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new ProjectError(401, "unauthorized", "请先登录");
    const body = (req.body ?? {}) as UpdateProjectRequest;
    res.json(updateProject(String(req.params.id), req.user.id, body));
  }),
);

/**
 * DELETE /api/projects/:id
 * 删除项目（仅 Owner）
 */
router.delete(
  "/projects/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new ProjectError(401, "unauthorized", "请先登录");
    deleteProject(String(req.params.id), req.user.id);
    res.status(204).end();
  }),
);

/**
 * POST /api/projects/:id/members
 * 邀请成员（仅 Owner）
 */
router.post(
  "/projects/:id/members",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new ProjectError(401, "unauthorized", "请先登录");
    const body = (req.body ?? {}) as InviteMemberRequest;
    const project = inviteMember(String(req.params.id), req.user.id, body);
    res.status(201).json(project);
  }),
);

/**
 * PATCH /api/projects/:id/members/:userId
 * 改成员角色（仅 Owner）
 */
router.patch(
  "/projects/:id/members/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new ProjectError(401, "unauthorized", "请先登录");
    const body = (req.body ?? {}) as UpdateMemberRoleRequest;
    res.json(
      updateMemberRole(
        String(req.params.id),
        req.user.id,
        String(req.params.userId),
        body.role,
      ),
    );
  }),
);

/**
 * DELETE /api/projects/:id/members/:userId
 * 移除成员（或自退）
 */
router.delete(
  "/projects/:id/members/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new ProjectError(401, "unauthorized", "请先登录");
    const project = removeMember(
      String(req.params.id),
      req.user.id,
      String(req.params.userId),
    );
    res.json(project);
  }),
);

export default router;

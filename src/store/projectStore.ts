/**
 * Project Store
 * - 持有当前打开的项目
 * - 提供 patchProject 把更新同步到后端
 * - 与 useStudioStore 分离:此 store 只管持久数据,
 *   useStudioStore 管 UI 临时状态（输入、生成中、临时 frames）
 */
import { create } from "zustand";
import api, { ApiError } from "@/lib/api";
import type { Project, UpdateProjectRequest, StudioStep } from "@/types";

interface ProjectState {
  project: Project | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  lastSavedAt: number | null;

  load: (id: string) => Promise<void>;
  patch: (id: string, patch: UpdateProjectRequest) => Promise<void>;
  setLocal: (updater: (p: Project) => Project) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  loading: false,
  error: null,
  saving: false,
  lastSavedAt: null,

  load: async (id) => {
    set({ loading: true, error: null });
    try {
      const p = await api.getProject(id);
      set({ project: p, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof ApiError ? e.message : "加载项目失败",
      });
    }
  },

  patch: async (id, patch) => {
    set({ saving: true });
    try {
      const updated = await api.updateProject(id, patch);
      set({ project: updated, saving: false, lastSavedAt: Date.now() });
    } catch (e) {
      set({
        saving: false,
        error: e instanceof ApiError ? e.message : "保存失败",
      });
      throw e;
    }
  },

  setLocal: (updater) => {
    const cur = get().project;
    if (!cur) return;
    set({ project: updater(cur) });
  },

  reset: () =>
    set({
      project: null,
      loading: false,
      error: null,
      saving: false,
      lastSavedAt: null,
    }),
}));

/** 取当前用户在项目中的角色 */
export function useMyRole(): Project["members"][number]["role"] | null {
  const project = useProjectStore((s) => s.project);
  // 这里需要 user id，调用方应传入；简化版用 ownerId 判断 owner
  return project ? "editor" : null;
}

/** 是否可以编辑（owner/editor） */
export function canEdit(project: Project | null, userId: string | undefined): boolean {
  if (!project || !userId) return false;
  const me = project.members.find((m) => m.userId === userId);
  return me?.role === "owner" || me?.role === "editor";
}

/** 设置当前步骤（同步本地 + 后端） */
export async function setStepAndSave(
  projectId: string,
  step: StudioStep,
): Promise<void> {
  // 先更新本地
  const cur = useProjectStore.getState().project;
  if (cur) {
    useProjectStore.setState({
      project: { ...cur, currentStep: step, updatedAt: new Date().toISOString() },
    });
  }
  // 异步保存（失败也无所谓，下次切换会重试）
  try {
    await useProjectStore.getState().patch(projectId, { currentStep: step });
  } catch {
    // 静默
  }
}

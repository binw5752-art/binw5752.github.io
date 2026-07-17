import { create } from "zustand";
import type { StudioState, Frame } from "@/types";

const initialFrames: Frame[] = [
  {
    id: "sf-1",
    index: 1,
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
      encodeURIComponent(
        "Manga panel: night street with neon reflections on wet pavement, lone figure with umbrella, dark moody atmosphere, dramatic ink wash, cinematic"
      ) +
      "&image_size=landscape_4_3",
    dialogue: "雨下了整整三天。",
    sceneDesc: "雨夜街道，霓虹倒影，主角独行",
    characterId: "demo",
  },
  {
    id: "sf-2",
    index: 2,
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
      encodeURIComponent(
        "Manga panel: mysterious door slightly ajar with golden light spilling out, dark hallway, ominous atmosphere, halftone texture"
      ) +
      "&image_size=landscape_4_3",
    dialogue: "门后……不该有光。",
    sceneDesc: "走廊尽头，半开的门后透出金光",
  },
  {
    id: "sf-3",
    index: 3,
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
      encodeURIComponent(
        "Manga panel: hand reaching for a glowing key on table, dramatic close-up, blue ambient light, particles"
      ) +
      "&image_size=landscape_4_3",
    dialogue: "这把钥匙，从来不属于我。",
    sceneDesc: "特写：手伸向桌上发光的钥匙",
  },
  {
    id: "sf-4",
    index: 4,
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
      encodeURIComponent(
        "Manga panel: figure looking into mirror, reflection showing different person, dramatic split composition, red and cyan lighting"
      ) +
      "&image_size=landscape_4_3",
    dialogue: "镜中人，是谁？",
    sceneDesc: "镜中倒影，是不一样的脸",
  },
];

const initialCharacters = [
  {
    id: "demo",
    name: "少年·阿七",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
      encodeURIComponent(
        "anime manga character portrait, young boy with messy black hair and blue eyes, hoodie, mysterious expression, dramatic lighting"
      ) +
      "&image_size=square",
    traits: ["寡言", "敏锐", "捡钥匙的人"],
    bio: "在雨夜捡到不该存在的钥匙，被卷入镜中世界的少年。",
    color: "#00E5FF",
  },
];

export const useStudioStore = create<StudioState>((set) => ({
  currentStep: "script",
  scriptInput: "",
  selectedStyle: "悬疑推理",
  selectedLength: "短篇 3 话",
  generatedScript: "",
  isGenerating: false,
  frames: initialFrames,
  characters: initialCharacters,
  renderProgress: 0,

  setStep: (step) => set({ currentStep: step }),
  setScriptInput: (input) => set({ scriptInput: input }),
  setStyle: (style) => set({ selectedStyle: style }),
  setLength: (length) => set({ selectedLength: length }),
  setGeneratedScript: (script) => set({ generatedScript: script }),
  setGenerating: (v) => set({ isGenerating: v }),
  setFrames: (frames) => set({ frames }),
  reorderFrames: (from, to) =>
    set((state) => {
      const next = [...state.frames];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return {
        frames: next.map((f, i) => ({ ...f, index: i + 1 })),
      };
    }),
  setRenderProgress: (n) => set({ renderProgress: n }),
  reset: () =>
    set({
      currentStep: "script",
      scriptInput: "",
      generatedScript: "",
      isGenerating: false,
      frames: initialFrames,
      renderProgress: 0,
    }),
}));

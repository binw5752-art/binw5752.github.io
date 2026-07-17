import type { AiCapability, PricePlan, FaqItem } from "@/types";

export const aiCapabilities: AiCapability[] = [
  {
    id: "script",
    title: "AI 剧本生成",
    subtitle: "Script Forge",
    desc: "输入一句灵感与风格，AI 三秒内为你产出三幕式完整剧本，自动埋设伏笔与反转。",
    icon: "PenLine",
    accent: "cinnabar",
  },
  {
    id: "storyboard",
    title: "智能分镜",
    subtitle: "Scene Board",
    desc: "剧本一键拆解为分镜序列，每帧画面、镜头角度、对白气泡自动安排，可拖拽编辑。",
    icon: "LayoutGrid",
    accent: "celadon",
  },
  {
    id: "character",
    title: "角色立绘",
    subtitle: "Soul Forge",
    desc: "为每个角色生成可复用的立绘与表情库，性格、对话风格、服装全套设定一键完成。",
    icon: "UserSquare",
    accent: "gold",
  },
  {
    id: "render",
    title: "一键成片",
    subtitle: "Final Cut",
    desc: "选中分镜即可渲染成片，自动配音、字幕、转场一气呵成，直接发布到作品库。",
    icon: "Clapperboard",
    accent: "cinnabar",
  },
];

export const scriptStyles = [
  "热血少年",
  "治愈日常",
  "悬疑推理",
  "古风权谋",
  "硬核科幻",
  "纯爱校园",
];

export const scriptLengths = ["短篇 3 话", "中篇 8 话", "长篇 24 话"];

/** 根据 input + style 生成 Mock 剧本 */
export function generateMockScript(input: string, style: string, length: string): string {
  const trimmed = input.trim() || "一个被遗忘的少年，在某个雨夜捡到了不该属于这个世界的钥匙";
  return `【${style} · ${length}】《${trimmed.slice(0, 12)}…》

—— 墨境 AI 剧本引擎 v3.2 输出 ——

▍第一幕 · 序章：雨夜来客

夜，雨。
霓虹在湿街之上碎成千道光痕。
${trimmed}

一个少年在巷口停下，手里攥着那把不应存在的钥匙。他知道这是错的，但他的手指在颤。
「这里……不该有这条路。」

▍第二幕 · 转折：被打开的门

钥匙转动，门后是一间从未存在过的房间。
桌上摆着一封写给他的信，落款是十年前的他自己。
—— 他从来不曾寄出过这封信，因为他根本不记得写过。

▍第三幕 · 高潮：替身与真名

镜中人开口了，声音和他一模一样：
「你以为你是钥匙的持有者，其实你只是它的容器。」
少年退后一步，雨声忽然消失。
他这才意识到，门后没有雨。

—— AI 已生成 3 幕 / 12 帧 / 4 角色卡。可继续扩展或进入分镜编辑。`;
}

export const pricePlans: PricePlan[] = [
  {
    id: "free",
    name: "体验版",
    price: 0,
    period: "永久免费",
    tagline: "试试墨境，从零开始",
    features: [
      { label: "每日 3 次剧本生成", included: true },
      { label: "单作品 6 帧分镜", included: true },
      { label: "标准画质渲染", included: true },
      { label: "作品带墨境水印", included: true },
      { label: "高清导出", included: false },
      { label: "商用授权", included: false },
      { label: "专属 AI 模型", included: false },
    ],
    cta: "免费开始",
  },
  {
    id: "creator",
    name: "创作者版",
    price: 39,
    period: "/ 月",
    tagline: "独立创作者的不二之选",
    highlight: true,
    features: [
      { label: "每日 50 次剧本生成", included: true },
      { label: "单作品 60 帧分镜", included: true },
      { label: "高清画质渲染", included: true },
      { label: "去水印 + 商用授权", included: true },
      { label: "角色立绘库 200 个", included: true },
      { label: "专属 AI 模型微调", included: false },
      { label: "批量生成 API", included: false },
    ],
    cta: "升级创作者",
  },
  {
    id: "studio",
    name: "工作室版",
    price: 299,
    period: "/ 月",
    tagline: "团队协作与商用首选",
    features: [
      { label: "无限剧本生成", included: true },
      { label: "无限分镜帧数", included: true },
      { label: "4K 超清渲染", included: true },
      { label: "团队协作 10 席位", included: true },
      { label: "专属 AI 模型微调", included: true },
      { label: "批量生成 API", included: true },
      { label: "专属客户成功经理", included: true },
    ],
    cta: "联系商务",
  },
];

export const faqs: FaqItem[] = [
  {
    q: "墨境生成的作品版权归谁？",
    a: "免费版生成的作品版权归墨境所有，需带水印展示。订阅创作者版与工作室版后，作品版权归创作者所有，并享有商用授权。",
  },
  {
    q: "AI 生成的角色立绘可以商用吗？",
    a: "可以。订阅版生成的所有角色立绘、分镜、成片均归创作者所有，可用于商业用途。但请勿生成侵犯他人肖像权或知识产权的内容。",
  },
  {
    q: "如何获取专属 AI 模型微调？",
    a: "工作室版订阅用户可上传 20-200 张参考图，由墨境团队为您微调专属风格模型，通常 3 个工作日内交付。",
  },
  {
    q: "支持团队协作吗？",
    a: "工作室版支持最多 10 个席位，可共享作品、分配角色、版本回滚。 Larger 团队可联系商务定制企业版。",
  },
  {
    q: "可以导出到 Premiere / After Effects 吗？",
    a: "可以。所有作品均支持导出为 PNG 序列 + SRT 字幕 + 工程文件，无缝接入主流后期软件。",
  },
  {
    q: "退款政策是什么？",
    a: "订阅后 7 天内未使用生成额度可全额退款。已使用额度的部分按比例退还。工作室版因涉及模型微调，一经启动不退款。",
  },
];

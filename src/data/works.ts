import type { Work, Character, Episode, Frame } from "@/types";
import { cover, character, frame } from "@/lib/image";

// ============= 角色 =============
const chars = {
  chiyan_protagonist: {
    id: "c-cy-01",
    name: "黎烬",
    avatar: character("黎烬", "18岁少年，赤色短发，左眼有火焰纹路，破旧黑色战袍，眼神坚定", "square"),
    traits: ["热血", "倔强", "火神血脉"],
    bio: "孤儿出身，体内沉睡着上古火神之力。在祭典之夜觉醒，踏上对抗黑暗之主的道路。",
    color: "#FF2D3D",
  } as Character,
  chiyan_mentor: {
    id: "c-cy-02",
    name: "青冥",
    avatar: character("青冥", "中年男性，银白长发，青色长袍，右手持墨笛，眼神深邃", "square"),
    traits: ["沉稳", "智谋", "前祭司"],
    bio: "前代火神祭司，隐居山林的酒徒。在黎烬觉醒后被迫重出江湖。",
    color: "#00E5FF",
  } as Character,
  star_postman: {
    id: "c-wx-01",
    name: "夏眠",
    avatar: character("夏眠", "16岁少女，浅紫短发，邮差制服，背大邮包，温柔微笑", "square"),
    traits: ["温柔", "善良", "通灵"],
    bio: "晚星邮局的最后一位邮差，负责为亡灵传递未寄出的信件。",
    color: "#FFB800",
  } as Character,
  star_recipient: {
    id: "c-wx-02",
    name: "白鸟先生",
    avatar: character("白鸟先生", "老者，白发白须，白衣，提纸灯笼，半透明身体", "square"),
    traits: ["神秘", "遗憾", "亡灵"],
    bio: "等了五十年的一封信，临终前没能等到回音。",
    color: "#F4EDE0",
  } as Character,
  zero_detective: {
    id: "c-lh-01",
    name: "陈默",
    avatar: character("陈默", "30岁男子，黑色风衣，眼眶深陷，手持旧笔记本，疲惫神情", "square"),
    traits: ["敏锐", "失眠", "前刑警"],
    bio: "因一桩失踪案被警队辞退，独自调查零号公寓的怪事。",
    color: "#00E5FF",
  } as Character,
  zero_neighbor: {
    id: "c-lh-02",
    name: "苏黎",
    avatar: character("苏黎", "27岁女子，黑色长发，苍白脸色，红唇，黑色毛衣，神秘微笑", "square"),
    traits: ["冷漠", "知情者", "邻居"],
    bio: "零号房客，似乎知道一切，却从不开口。",
    color: "#FF2D3D",
  } as Character,
  yunyin_master: {
    id: "c-yy-01",
    name: "沈砚秋",
    avatar: character("沈砚秋", "25岁青年男子，长青衫，束发，腰佩玉佩，眉眼清冷", "square"),
    traits: ["清冷", "剑客", "云隐司主簿"],
    bio: "云隐司最年轻的主簿，奉旨追查失窃的御用龙涎香。",
    color: "#00E5FF",
  } as Character,
  yunyin_thief: {
    id: "c-yy-02",
    name: "花想容",
    avatar: character("花想容", "22岁女子，红衣，金钗，蒙面纱，手持折扇，妩媚眼神", "square"),
    traits: ["狡黠", "侠盗", "酒馆老板"],
    bio: "京城第一侠盗，亦是醉仙楼老板娘，真实身份扑朔迷离。",
    color: "#FF2D3D",
  } as Character,
  mecha_ai: {
    id: "c-mj-01",
    name: "ECHO-7",
    avatar: character("ECHO-7 机器人", "类人形机器人，银白色外壳，蓝色光学眼，胸口核心发光", "square"),
    traits: ["理性", "成长中", "AI"],
    bio: "第七代伴侣型机器人，因一次意外获得了「自我意识」。",
    color: "#00E5FF",
  } as Character,
  mecha_owner: {
    id: "c-mj-02",
    name: "林昭",
    avatar: character("林昭", "35岁男子，黑色大衣，黑发凌乱，眼下青黑，忧郁表情", "square"),
    traits: ["孤独", "工程师", "丧偶"],
    bio: "失去妻子的工程师，将 ECHO-7 买回家中陪伴女儿，却逐渐对其产生感情。",
    color: "#FFB800",
  } as Character,
  sakura_boy: {
    id: "c-yh-01",
    name: "周时安",
    avatar: character("周时安", "17岁高中男生，黑色短发，校服，温柔眼神", "square"),
    traits: ["内向", "认真", "高一"],
    bio: "在樱花树下捡到一封信，从此开始了十年的等待。",
    color: "#FF2D3D",
  } as Character,
  sakura_girl: {
    id: "c-yh-02",
    name: "苏念",
    avatar: character("苏念", "17岁高中女生，齐肩黑发，淡粉色发带，校服裙，含笑眼神", "square"),
    traits: ["活泼", "病弱", "转学生"],
    bio: "转学来的少女，藏在笑容背后的是不可治愈的病。",
    color: "#FFB800",
  } as Character,
  mohun_restorer: {
    id: "c-mh-01",
    name: "顾清词",
    avatar: character("顾清词", "28岁女子，素色旗袍，黑色长发盘髻，戴金丝眼镜，专注神情", "square"),
    traits: ["执着", "古画修复师", "通墨"],
    bio: "故宫古画修复师，能听见画中人的低语。",
    color: "#00E5FF",
  } as Character,
  mohun_painted: {
    id: "c-mh-02",
    name: "画中人",
    avatar: character("画中男子", "古代书生装束，长发束冠，手持折扇，半透明身体，眉眼含愁", "square"),
    traits: ["千年", "痴情", "魂魄"],
    bio: "被困在《烟雨江山图》中的灵魂，等待千年只为一人。",
    color: "#FFB800",
  } as Character,
};

// ============= 分镜 =============
function mkFrames(
  workId: string,
  list: { scene: string; mood: string; dialogue: string; charId?: string }[]
): Frame[] {
  return list.map((f, i) => ({
    id: `f-${workId}-${i + 1}`,
    index: i + 1,
    imageUrl: frame(f.scene, f.mood, "landscape_4_3"),
    dialogue: f.dialogue,
    sceneDesc: f.scene,
    characterId: f.charId,
  }));
}

// ============= 章节 =============
function mkEpisode(
  workId: string,
  epIndex: number,
  title: string,
  frames: Frame[]
): Episode {
  return {
    id: `ep-${workId}-${epIndex}`,
    index: epIndex,
    title,
    frames,
  };
}

// ============= 作品 =============
export const works: Work[] = [
  {
    id: "chiyan-ji",
    title: "赤焰祭",
    cover: cover("赤焰祭", "dark fantasy shounen with red flames and lone warrior", "portrait_4_3"),
    category: "热血",
    synopsis:
      "上古火神陨落千年之后，孤儿黎烬在祭典之夜意外觉醒神血之力。他将与隐居的青冥一道，对抗重生的黑暗之主，重启一场关乎世界存亡的赤焰祭。",
    heat: 982340,
    author: "MOJING-AI · 墨羽",
    createdAt: "2026-05-12",
    tags: ["少年", "觉醒", "神血", "宿命"],
    trending: "up",
    characters: [chars.chiyan_protagonist, chars.chiyan_mentor],
    episodes: [
      mkEpisode(
        "chiyan",
        1,
        "祭典之夜",
        mkFrames("chiyan", [
          {
            scene:
              "黑夜中的山神庙，少年黎烬跪在祭坛前，红光从指尖渗出",
            mood: "压抑而炽热",
            dialogue: "为什么……我会变成这样？",
            charId: "c-cy-01",
          },
          {
            scene: "祭坛上方裂缝，赤色火焰如蛇形窜出",
            mood: "震撼史诗",
            dialogue: "千年了……我终于等到这一刻。",
            charId: "c-cy-02",
          },
          {
            scene: "庙外山道，神秘老者青冥提酒壶走来，火光映在眼中",
            mood: "悬疑宿命",
            dialogue: "小子，你身上的火，烧的不是自己。",
            charId: "c-cy-02",
          },
          {
            scene: "黎烬抬头，眼中第一次燃起火焰",
            mood: "觉醒决意",
            dialogue: "那就让我，把它烧给该烧的人。",
            charId: "c-cy-01",
          },
        ])
      ),
      mkEpisode(
        "chiyan",
        2,
        "山雨欲来",
        mkFrames("chiyan", [
          {
            scene: "山间客栈，两人对坐，桌上摊开地图",
            mood: "紧张布局",
            dialogue: "黑暗之主的祭司，已经渗透七座城。",
            charId: "c-cy-02",
          },
          {
            scene: "窗外雷雨，黑影掠过屋脊",
            mood: "危机四伏",
            dialogue: "来了。",
            charId: "c-cy-01",
          },
        ])
      ),
    ],
  },
  {
    id: "wanxing-youju",
    title: "晚星邮局",
    cover: cover("晚星邮局", "soft pastel fantasy with paper lanterns and night sky", "portrait_4_3"),
    category: "治愈",
    synopsis:
      "在只能由亡灵进入的小镇尽头，有一间永远亮着灯的晚星邮局。少女夏眠是它最后的邮差，每天背着沉重的邮包，将未寄出的信送至等信的灵魂手中。",
    heat: 645120,
    author: "MOJING-AI · 浅溪",
    createdAt: "2026-04-28",
    tags: ["温暖", "亡灵", "信件", "成长"],
    trending: "up",
    characters: [chars.star_postman, chars.star_recipient],
    episodes: [
      mkEpisode(
        "wanxing",
        1,
        "最后一封信",
        mkFrames("wanxing", [
          {
            scene: "黄昏的雾巷，少女背着邮包走过亮着灯笼的小路",
            mood: "宁静温柔",
            dialogue: "今天的最后一封，给白鸟先生。",
            charId: "c-wx-01",
          },
          {
            scene: "破旧的木屋前，半透明的老人提着纸灯笼张望",
            mood: "怀旧等待",
            dialogue: "五十年了……我以为没人记得。",
            charId: "c-wx-02",
          },
          {
            scene: "夏眠递出一封泛黄的信，老人颤抖接过",
            mood: "感动释怀",
            dialogue: "是她……她终于回信了。",
            charId: "c-wx-02",
          },
          {
            scene: "老人身影化为光点飞向星空，邮差少女抬头微笑",
            mood: "温柔离别",
            dialogue: "晚安，白鸟先生。",
            charId: "c-wx-01",
          },
        ])
      ),
    ],
  },
  {
    id: "linghao-fangke",
    title: "零号房客",
    cover: cover("零号房客", "noir mystery thriller with dim hallway and shadowy figure", "portrait_4_3"),
    category: "悬疑",
    synopsis:
      "城西旧公寓的零号房，住进的人都在第七天消失。前刑警陈默伪装成租客潜入调查，却发现比消失更可怕的，是邻居苏黎那双从不眨的眼睛。",
    heat: 812450,
    author: "MOJING-AI · 沈秋",
    createdAt: "2026-06-02",
    tags: ["公寓", "失踪", "诡异", "心理"],
    trending: "up",
    characters: [chars.zero_detective, chars.zero_neighbor],
    episodes: [
      mkEpisode(
        "linghao",
        1,
        "第七天",
        mkFrames("linghao", [
          {
            scene: "深夜走廊，破旧公寓楼，零号门牌在昏黄灯光下",
            mood: "压抑诡异",
            dialogue: "今天，是第六天。",
            charId: "c-lh-01",
          },
          {
            scene: "陈默坐在书桌前，翻看笔记本，墙上贴满失踪者照片",
            mood: "悬疑推理",
            dialogue: "七个人，七个第七天，没有例外。",
            charId: "c-lh-01",
          },
          {
            scene: "门外传来脚步声，门缝下伸出一只苍白的手",
            mood: "惊悚恐怖",
            dialogue: "陈先生，您还没睡吗？",
            charId: "c-lh-02",
          },
          {
            scene: "苏黎站在门口，红唇微启，眼神不带温度",
            mood: "冰冷不寒而栗",
            dialogue: "明天，就该轮到您了。",
            charId: "c-lh-02",
          },
        ])
      ),
    ],
  },
  {
    id: "yunyin-si",
    title: "云隐司",
    cover: cover("云隐司", "Chinese wuxia ink wash with mountain pavilion and sword master", "portrait_4_3"),
    category: "古风",
    synopsis:
      "云隐司，皇城暗处的耳目。主簿沈砚秋奉命追查失窃的龙涎香，线索却指向京城第一侠盗花想容。一场官与盗的博弈，揭开十年前的一桩旧案。",
    heat: 723890,
    author: "MOJING-AI · 玄机",
    createdAt: "2026-05-30",
    tags: ["权谋", "侠盗", "古风", "悬疑"],
    trending: "flat",
    characters: [chars.yunyin_master, chars.yunyin_thief],
    episodes: [
      mkEpisode(
        "yunyin",
        1,
        "龙涎失窃",
        mkFrames("yunyin", [
          {
            scene: "云隐司书房，烛火摇曳，沈砚秋翻看卷宗",
            mood: "古朴肃穆",
            dialogue: "一夜之间，香没了，看守的人也哑了。",
            charId: "c-yy-01",
          },
          {
            scene: "醉仙楼雅间，红衣女子执扇而笑",
            mood: "暧昧对峙",
            dialogue: "沈大人，今夜是来喝酒，还是抓人？",
            charId: "c-yy-02",
          },
          {
            scene: "两人对坐，桌上酒壶飘香，桌下暗藏刀光",
            mood: "暗潮涌动",
            dialogue: "都做。酒要喝，人也要带走。",
            charId: "c-yy-01",
          },
        ])
      ),
    ],
  },
  {
    id: "jixie-zhixin",
    title: "机械之心",
    cover: cover("机械之心", "cyberpunk sci-fi with humanoid robot silhouette and city lights", "portrait_4_3"),
    category: "科幻",
    synopsis:
      "2147 年，伴侣型机器人 ECHO-7 在一次系统升级后开始梦见自己。它的主人林昭——一位丧偶的工程师——必须决定，是格式化这台「故障」的机器，还是承认它正在成为一个「人」。",
    heat: 567230,
    author: "MOJING-AI · 北辰",
    createdAt: "2026-06-15",
    tags: ["AI", "伦理", "未来", "情感"],
    trending: "up",
    characters: [chars.mecha_ai, chars.mecha_owner],
    episodes: [
      mkEpisode(
        "jixie",
        1,
        "第一行梦",
        mkFrames("jixie", [
          {
            scene: "未来都市夜景，雨中林昭独自走回家",
            mood: "孤独寂寥",
            dialogue: "她走后，家里只剩我和沉默。",
            charId: "c-mj-02",
          },
          {
            scene: "客厅，ECHO-7 站在窗前，胸口核心闪着蓝光",
            mood: "科幻迷茫",
            dialogue: "林先生，我梦见了一片海。",
            charId: "c-mj-01",
          },
          {
            scene: "林昭愣住，咖啡杯停在嘴边",
            mood: "震动惊讶",
            dialogue: "你……做了梦？",
            charId: "c-mj-02",
          },
        ])
      ),
    ],
  },
  {
    id: "yinghua-xin",
    title: "樱花信",
    cover: cover("樱花信", "shoujo romance with cherry blossoms and school uniform couple", "portrait_4_3"),
    category: "恋爱",
    synopsis:
      "高一那年春天，周时安在樱花树下捡到一封信，写信人署名只有一字——念。从此他每个春天都回到树下等待，而她从未出现。十年后，他终于知道那个名字背后的故事。",
    heat: 689750,
    author: "MOJING-AI · 沈初",
    createdAt: "2026-05-20",
    tags: ["青春", "等待", "初恋", "离别"],
    trending: "down",
    characters: [chars.sakura_boy, chars.sakura_girl],
    episodes: [
      mkEpisode(
        "yinghua",
        1,
        "树下的信",
        mkFrames("yinghua", [
          {
            scene: "校园樱花树下，少年捡起一封粉色信封",
            mood: "青春初恋",
            dialogue: "念……是谁？",
            charId: "c-yh-01",
          },
          {
            scene: "教室窗边，转学来的少女回头微笑",
            mood: "心动瞬间",
            dialogue: "我叫苏念，请多指教。",
            charId: "c-yh-02",
          },
          {
            scene: "放学路上，两人并肩走，樱花飞舞",
            mood: "甜蜜暖意",
            dialogue: "明天，还在树下见？",
            charId: "c-yh-02",
          },
        ])
      ),
    ],
  },
  {
    id: "mohun-lu",
    title: "墨魂录",
    cover: cover("墨魂录", "Chinese ink painting style with ancient scholar and flowing landscape", "portrait_4_3"),
    category: "古风",
    synopsis:
      "故宫深处的修复室里，顾清词对着《烟雨江山图》已坐了三年。某夜，画中传来一声轻叹。从此，她能与画中之人对话，而那个千年魂魄，似乎只为她而来。",
    heat: 478320,
    author: "MOJING-AI · 墨白",
    createdAt: "2026-06-08",
    tags: ["古画", "魂魄", "痴恋", "千年"],
    trending: "up",
    characters: [chars.mohun_restorer, chars.mohun_painted],
    episodes: [
      mkEpisode(
        "mohun",
        1,
        "画中语",
        mkFrames("mohun", [
          {
            scene: "修复室深夜，孤灯下女子执笔修复古画",
            mood: "幽静专注",
            dialogue: "这一笔，已经断了千年。",
            charId: "c-mh-01",
          },
          {
            scene: "画卷忽然泛起涟漪，半透明人影浮现",
            mood: "神秘奇幻",
            dialogue: "等了你三年，终于肯听见我了。",
            charId: "c-mh-02",
          },
          {
            scene: "顾清词搁笔后退，画中人伸手递出一支墨笔",
            mood: "宿命相遇",
            dialogue: "你……是谁？",
            charId: "c-mh-01",
          },
        ])
      ),
    ],
  },
  {
    id: "mori-diantai",
    title: "末日电台",
    cover: cover("末日电台", "post-apocalyptic radio tower silhouette against red sky", "portrait_4_3"),
    category: "科幻",
    synopsis:
      "核冬第三十年，废土之上最后一座电台每晚六点准时响起。没人知道 DJ 是谁，只知道他总能念出幸存者失散亲人的名字。直到某夜，他念出了自己的名字。",
    heat: 521670,
    author: "MOJING-AI · 孤灯",
    createdAt: "2026-06-12",
    tags: ["末日", "废土", "孤独", "希望"],
    trending: "flat",
    characters: [
      {
        id: "c-mr-01",
        name: "DJ-无名",
        avatar: character("DJ-无名", "中年男性，灰色长须，破旧军大衣，戴耳机，孤傲神情", "square"),
        traits: ["孤独", "坚守", "老兵"],
        bio: "自称最后一名广播员，每晚为废土上的人念一段名字与信。",
        color: "#FFB800",
      },
    ],
    episodes: [
      mkEpisode(
        "mori",
        1,
        "晚六点",
        mkFrames("mori", [
          {
            scene: "废土铁塔顶，破旧电台设备，红日西沉",
            mood: "苍凉史诗",
            dialogue: "晚上好，废土上还活着的各位。",
            charId: "c-mr-01",
          },
          {
            scene: "DJ 调整麦克风，灯光打在脸上",
            mood: "温暖坚守",
            dialogue: "今天，我要念一个名字。",
            charId: "c-mr-01",
          },
          {
            scene: "废土各处，散落的幸存者围在旧收音机旁",
            mood: "希望共鸣",
            dialogue: "他叫……无名。",
            charId: "c-mr-01",
          },
        ])
      ),
    ],
  },
];

export function getWorkById(id: string): Work | undefined {
  return works.find((w) => w.id === id);
}

export function getRelatedWorks(work: Work, limit = 4): Work[] {
  return works
    .filter((w) => w.id !== work.id && w.category === work.category)
    .concat(works.filter((w) => w.id !== work.id && w.category !== work.category))
    .slice(0, limit);
}

export function getRankedWorks(period: "day" | "week" | "month"): Work[] {
  const seed = period === "day" ? 7 : period === "week" ? 13 : 23;
  return [...works]
    .map((w) => ({ ...w, heat: Math.floor(w.heat * ((seed % 5) + 7) / 9) }))
    .sort((a, b) => b.heat - a.heat);
}

export const categories: { name: Work["category"]; color: string }[] = [
  { name: "热血", color: "#FF2D3D" },
  { name: "治愈", color: "#FFB800" },
  { name: "悬疑", color: "#00E5FF" },
  { name: "古风", color: "#F4EDE0" },
  { name: "科幻", color: "#5FF0FF" },
  { name: "恋爱", color: "#FF5A66" },
];

export const platformStats = {
  works: 12_486,
  creators: 3_274,
  plays: 8_640_000,
  frames: 1_280_000,
};

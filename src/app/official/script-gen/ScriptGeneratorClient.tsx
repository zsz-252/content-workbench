"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AISettingsModal from "@/components/AISettingsModal";
import { chat, extractJSON } from "@/lib/ai/client";
import { loadSettings, isConfigured, getProvider, resolveEndpoint } from "@/lib/ai/providers";
import {
  ScrollText, Loader2, Sparkles, Copy, CheckCheck, ChevronDown, ChevronUp,
  Mic2, FileText, AlignLeft, Clock, Clapperboard, Video,
  User, Building2, BriefcaseBusiness, Settings2, AlertCircle,
} from "lucide-react";

// ─── AI 调用（用户自带 Key，支持 DeepSeek / Qwen / Kimi / GLM / 自定义） ──────────
async function callAI(
  prompt: string,
  opts: { system?: string; onDelta?: (c: string, full: string) => void } = {}
) {
  return chat(prompt, {
    system: opts.system,
    onDelta: opts.onDelta,
    temperature: 0.3,
    maxTokens: 8192,
  });
}

// ─── 常量 ──────────────────────────────────────────────────────────────────────
const SCRIPT_TYPES = [
  { value: "outline",   label: "采访大纲",   icon: FileText,     desc: "整理采访问题框架与追问逻辑" },
  { value: "interview", label: "专访脚本",   icon: Mic2,         desc: "含开场钩子、分段引导词与收尾" },
  { value: "narration", label: "口播解读",   icon: AlignLeft,    desc: "观点型口播，适合资讯/行业解读" },
  { value: "creative",  label: "创意视频脚本", icon: Clapperboard, desc: "Save the Cat 结构，含分镜/VO/花字" },
];

const CREATIVE_VIDEO_FORMS = ["创意短片", "剧情片", "纪实采访", "动画", "AI生成", "混合"];
const CREATIVE_DURATIONS    = ["30秒", "60秒", "90秒", "3分钟"];
const CREATIVE_STYLES       = ["幽默搞笑", "走心温情", "悬疑反转", "科技感", "纪实质感", "热血燃向"];

const OUTLINE_INTERVIEW_TYPES = [
  { value: "专访",     desc: "深度挖掘，40-60分钟，10题" },
  { value: "大会采访", desc: "紧凑高效，约30分钟，5题" },
  { value: "对谈",     desc: "双方观点碰撞，约1小时，8题" },
  { value: "深度访谈", desc: "长线深挖，60-90分钟，15题" },
];


const PLATFORMS = ["视频号", "抖音", "小红书", "B站"];
const ACCOUNTS = [
  "城市美食观察", "本地生活笔记", "周末去哪儿",
  "健康生活指南", "小店成长记", "即时零售观察",
];
const DURATIONS = ["15秒", "30秒", "60秒", "3分钟", "5分钟", "10分钟以上"];

// ─── Mock 生成结果 ──────────────────────────────────────────────────────────────
const MOCK_INTERVIEW = {
  type: "interview",
  title: "【专访脚本】连锁餐饮品牌如何借势618实现GMV突破",
  outline: [
    {
      section: "开场破冰",
      timeCode: "0:00 – 0:30",
      questions: [
        "请您用一句话介绍一下您目前的身份和主要工作方向？",
        "是什么机缘让您进入餐饮这个行业的？",
      ],
    },
    {
      section: "核心洞察",
      timeCode: "0:30 – 2:30",
      questions: [
        "您观察到今年618和往年最大的不同是什么？消费者端有哪些信号？",
        "贵品牌在平台端做了哪些针对性的备战动作？具体数据表现如何？",
        "这次能突破GMV的底层逻辑是什么？",
      ],
    },
    {
      section: "深度追问",
      timeCode: "2:30 – 4:00",
      questions: [
        "很多餐饮老板说「大促流量不稳定」，您怎么看这个问题？",
        "在平台工具使用上，您觉得最有效的3个功能是什么？",
        "有没有一次踩坑经历，帮助你后来做对了某件事？",
      ],
    },
    {
      section: "实操建议",
      timeCode: "4:00 – 5:00",
      questions: [
        "对于还没有系统做线上运营的餐饮老板，您最想给他们的建议是什么？",
        "有没有可以快速上手的一个小方法？",
      ],
    },
    {
      section: "收尾展望",
      timeCode: "5:00 – 5:30",
      questions: [
        "您接下来最期待看到平台哪个方向的突破？",
        "对今年下半年有什么期待？",
      ],
    },
  ],
  openingHook: "「他的餐厅连锁70家，618单日GMV破了他开业以来的最高记录——但他说，真正的秘诀不是促销，是数据。」",
  closingLine: "「如果你也想做出自己的爆发节点，欢迎评论区留下你的问题，我们下期专门来聊。」",
};

const MOCK_OUTLINE = {
  type: "outline",
  title: "【采访大纲】连锁餐饮品牌618备战 — 采访问题框架",
  arcLine: "建立信任（品牌故事）→ 数据突破背后的逻辑 → 平台价值点自然带出 → 金句收尾",
  interviewType: "专访",
  questions: [
    {
      section: "人物背景确认",
      note: "核实姓名、职位，建立轻松氛围，不要让对方感觉在背答案",
      items: [
        {
          q: "贵品牌目前在全国的门店规模大概是多少？是什么阶段进入餐饮这个行业的？",
          refAnswers: ["规模数字+时间线", "创业初心或转型背景", "有无行业从业经历"],
          goldenQuote: "做餐饮，入行那一刻我就知道这是一辈子的事。",
          followUp: "当时最难的一关是什么？",
        },
      ],
    },
    {
      section: "核心话题切入",
      note: "从具体数据/事件切入，避免空泛问题",
      items: [
        {
          q: "今年618大促，能透露一个最让您意外的数据吗？",
          refAnswers: ["具体GMV/订单量数字", "增长幅度对比", "某个时段的峰值"],
          goldenQuote: "那天的数字刷屏了，我以为是系统出bug。",
          followUp: "这个数字背后，你们具体做了哪几件事？",
        },
        {
          q: "和往年相比，今年消费者的行为有哪些信号让你印象深刻？",
          refAnswers: ["下单时段变化", "品类偏好变化", "用户评价关键词"],
          goldenQuote: "消费者比我们更早感知到趋势。",
          followUp: null,
        },
      ],
    },
    {
      section: "深度追问",
      note: "根据受访人回答灵活切入，挖掘「立场与行为的裂缝」",
      items: [
        {
          q: "很多餐饮老板说「大促流量不稳定」，你怎么看这个矛盾？",
          refAnswers: ["承认问题并给出应对策略", "用数据反驳", "转化视角：流量质量vs数量"],
          goldenQuote: "流量不稳定是因为你没有把它变成自己的。",
          followUp: "你们是怎么把大促流量留住的？",
        },
        {
          q: "在平台工具使用上，你觉得最有价值的一个功能是什么？为什么？",
          refAnswers: ["数据分析类工具", "营销活动工具", "用户运营工具"],
          goldenQuote: "会用数据的老板和不会用的，差距已经不是一点点。",
          followUp: null,
        },
      ],
    },
    {
      section: "收尾展望",
      note: "触及根本，适合在信任建立后抛出，提炼金句素材",
      items: [
        {
          q: "做了这么多年，有没有哪一刻让你觉得——这件事值了？",
          refAnswers: ["一个感性时刻", "某个顾客的反馈", "数据里的某个里程碑"],
          goldenQuote: "那一刻我突然明白，做餐饮做的不是生意，是人情。",
          followUp: null,
        },
      ],
    },
  ],
  tips: [
    "采访前发送提纲，但叮嘱受访者不要准备「标准答案」——真实反应比完美回答更有价值",
    "全程录音备用，关键数字现场核实确认，避免后期剪辑时数据出入",
    "如受访者谈到敏感竞品对比，提示可以模糊化处理，聚焦自身经验即可",
  ],
};

const MOCK_NARRATION = {
  type: "narration",
  title: "【口播解读】2026年餐饮行业三大关键趋势",
  hook: "你以为餐饮难做，但这3个数据，让我重新认识了这个行业。",
  paragraphs: [
    {
      label: "引入数据",
      text: "2026年上半年，本地餐饮线上订单量同比增长了23%。这个数字背后，有一个很多人忽略的信号——不是大品牌在增长，而是腰部的精品小店在爆发。",
      note: "开场数据要真实，建议核实后替换",
    },
    {
      label: "趋势一：本地化竞争加剧",
      text: "第一个趋势：本地化。过去大家靠全国连锁打规模，现在消费者更愿意为「家门口的那家店」买单。在3公里圈层内做到第一，比全城第十更有价值。",
      note: "可插入具体商家案例作为佐证",
    },
    {
      label: "趋势二：数字化工具提效",
      text: "第二个趋势：工具化。会用商家后台做数据分析的老板，和不会用的，现在差距已经拉到了3倍以上。这不是会不会的问题，是愿不愿意学的问题。",
      note: "语气直接，引发共鸣",
    },
    {
      label: "趋势三：内容即流量",
      text: "第三个趋势：内容化。短视频带来的进店转化，正在悄悄超过传统搜索。一条好的探店视频，能顶过去一个月的广告费。",
      note: "结合具体案例会更有说服力",
    },
    {
      label: "结尾互动引导",
      text: "这三个趋势你观察到了吗？评论区告诉我你在哪个城市做餐饮，我来看看你们那边的情况。",
      note: "引导评论互动，提升账号权重",
    },
  ],
};

const MOCK_CREATIVE = {
  type: "creative",
  title: "【创意视频脚本】深夜陪伴品牌短片",
  summary: "深夜加班的年轻人，一份外卖送来的不只是食物，是城市里陌生人之间无声的陪伴。以 Save the Cat 五幕结构呈现，情感向品牌短片，适合视频号/抖音投放。",
  videoForm: "创意短片",
  videoDuration: "60秒",
  beats: [
    {
      beatName: "建立世界（Opening Image）",
      timeCode: "0:00 – 0:08",
      vo: "凌晨两点，这座城市的大多数人已经入睡。",
      shotDesc: "航拍城市夜景，灯火渐稀；切近景，写字楼内零星亮灯的窗户；主角低头看屏幕，眼神疲惫。",
      subtitle: "凌晨 2:07",
    },
    {
      beatName: "触发事件（Catalyst）",
      timeCode: "0:08 – 0:18",
      vo: "他已经连续工作了十四个小时，肚子响了第三次。",
      shotDesc: "主角看了眼手机，打开外卖App；镜头推进屏幕，点单动作特写；下单成功，预计30分钟。",
      subtitle: "预计送达：02:38",
    },
    {
      beatName: "旅程中段（Midpoint）",
      timeCode: "0:18 – 0:38",
      vo: "骑手老陈已经送了200多单，今晚是他月底最后一班。",
      shotDesc: "平行剪辑：骑手穿越空旷街道，呼出白气；主角趴桌小憩；骑手抵达楼下，按门铃；主角醒来，小跑去拿餐。",
      subtitle: "（空镜字幕）这座城市，从未真正入睡",
    },
    {
      beatName: "情感高潮（All Is Lost / Dark Night）",
      timeCode: "0:38 – 0:50",
      vo: "袋子里有一张小纸条，歪歪扭扭写着——加班辛苦了，记得吃热的。",
      shotDesc: "主角打开外卖袋，发现纸条特写；表情从疲惫到愣住，再到眼眶微红；窗外路灯下骑手身影远去。",
      subtitle: "加班辛苦了，记得吃热的。",
    },
    {
      beatName: "结尾画面（Final Image）",
      timeCode: "0:50 – 1:00",
      vo: "每一份准时送达的外卖，都是一次无声的陪伴。准时送达，与你在一起。",
      shotDesc: "主角对着空气轻轻点头，拆开餐盒热气升腾；画面渐暗，品牌 Logo 淡入；结尾定格：城市夜景+品牌 Slogan。",
      subtitle: "准时送达，与你在一起。",
    },
  ],
};

// ─── 子组件 ────────────────────────────────────────────────────────────────────
function CollapsibleSection({ title, badge, timeCode, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v: boolean) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-gray-900 shrink-0"
            style={{ background: "#FFD100" }}>{badge}</span>
          <span className="font-semibold text-sm text-gray-800">{title}</span>
          {timeCode && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{timeCode}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="divide-y divide-gray-100">{children}</div>}
    </div>
  );
}

function CopyBtn({ text, className = "" }: any) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className={`text-gray-400 hover:text-gray-600 transition-colors ${className}`}
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ─── 主组件 ────────────────────────────────────────────────────────────────────
export default function ScriptGeneratorClient() {
  const searchParams = useSearchParams();
  const [scriptType, setScriptType] = useState("narration");
  const [topic, setTopic]     = useState("");
  const [guest, setGuest]     = useState("");
  const [angle, setAngle]     = useState("");
  const [account, setAccount] = useState("");
  const [platform, setPlatform] = useState("视频号");
  const [duration, setDuration] = useState("5分钟");
  const [status, setStatus]   = useState("idle");
  const [result, setResult]   = useState<any>(null);
  // AI 相关
  const [showSettings, setShowSettings] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiLabel, setAiLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [streamText, setStreamText] = useState("");
  const [fromHotspot, setFromHotspot] = useState(false);
  // creative 专属 state
  const [creativeBg,    setCreativeBg]    = useState("");
  const [creativeDir,   setCreativeDir]   = useState("");
  const [creativeForm,  setCreativeForm]  = useState("创意短片");
  const [creativeDur,   setCreativeDur]   = useState("60秒");
  const [creativeStyle, setCreativeStyle] = useState("");
  // outline（采访大纲）专属 state
  const [outlineGuestName,  setOutlineGuestName]  = useState("");
  const [outlineGuestTitle, setOutlineGuestTitle] = useState("");
  const [outlineExtra,      setOutlineExtra]      = useState("");
  const [outlineType,       setOutlineType]       = useState("");
  // interview（专访脚本 A1）专属 state — video-script Skill #94313
  const [interviewTranscript, setInterviewTranscript] = useState("");  // 采访转写/素材
  const [interviewBg,         setInterviewBg]         = useState("");  // 传播背景
  // narration（口播解读 A2）专属 state — video-script Skill #94313
  const [narrationMaterial, setNarrationMaterial] = useState("");  // 报道/文章/数据素材
  const [narrationMode,     setNarrationMode]     = useState("商业拆解型");  // 写法模式

  // 从热点页跳转过来时，自动预填表单并触发生成
  const [autoTrigger, setAutoTrigger] = useState(false);

  useEffect(() => {
    const t  = searchParams.get("topic");
    const a  = searchParams.get("angle");
    const ac = searchParams.get("account");
    const ty = searchParams.get("type");
    if (t) {
      setTopic(t);
      if (a)  setAngle(a);
      if (ac) setAccount(ac);
      if (ty && ["outline","interview","narration","creative"].includes(ty)) setScriptType(ty);
      setFromHotspot(true);
      setAutoTrigger(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当 autoTrigger 被设为 true 时，自动调用生成
  useEffect(() => {
    if (autoTrigger) {
      setAutoTrigger(false);
      // 延迟一帧确保 state 已更新
      setTimeout(() => handleGenerate(), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTrigger]);

  // 读取 AI 配置状态（并监听设置变更）
  const refreshAiState = useCallback(() => {
    const s = loadSettings();
    const ok = isConfigured(s);
    setAiReady(ok);
    if (ok) {
      const { model } = resolveEndpoint(s);
      const pname = getProvider(s.providerId)?.name ?? "";
      setAiLabel(`${pname} · ${model}`);
    } else {
      setAiLabel("未配置");
    }
  }, []);

  useEffect(() => {
    refreshAiState();
    window.addEventListener("ai-settings-changed", refreshAiState);
    return () => window.removeEventListener("ai-settings-changed", refreshAiState);
  }, [refreshAiState]);

  const handleGenerate = async () => {
    // 未配置 Key 时直接引导去设置，避免白白等待一次失败
    if (!isConfigured(loadSettings())) {
      setShowSettings(true);
      return;
    }
    setErrorMsg("");
    setStreamText("");

    if (scriptType === "creative") {
      if (!creativeBg.trim() || !creativeDir.trim()) return;
      setStatus("loading");
      setResult(null);
      try {
        // 构建 Skill #96222 结构化输入提示词
        const prompt = `你是一位专业创意视频脚本生成专家，基于 Save the Cat Beat Sheet 结构生成完整创意视频脚本。

请根据以下信息生成创意视频脚本：

【传播背景】${creativeBg}
【创意方向】${creativeDir}
【视频形式】${creativeForm}
【目标时长】${creativeDur}${creativeStyle ? `\n【视频风格】${creativeStyle}` : ""}${platform ? `\n【目标平台】${platform}` : ""}${account ? `\n【发布账号】${account}` : ""}

请严格按照以下 JSON 格式输出，不要输出任何其他内容，只输出 JSON：

{
  "title": "【创意视频脚本】脚本标题",
  "summary": "一段创意概述，说明核心洞察、故事类型和创意手法",
  "videoForm": "${creativeForm}",
  "videoDuration": "${creativeDur}",
  "beats": [
    {
      "beatName": "beat名称（如：建立世界/触发事件/玩闹和游戏/失去一切/终场画面）",
      "timeCode": "时间码（如：0:00 – 0:08）",
      "vo": "VO文案，口语化，每句≤15字，长短句交替",
      "shotDesc": "画面镜头描述，需写清景别（远/全/中/近/特）、角度、运镜方式、画面主体和动作",
      "subtitle": "花字/字幕内容（可为空字符串）"
    }
  ]
}

注意：
- beats 数量根据时长决定：30秒=3个beat，60秒=5个beat，90秒=7个beat，3分钟=10个beat
- 每个 beat 的 vo 和 shotDesc 必须具体，不能空泛
- 只输出 JSON，不要有任何解释文字`;

        const raw = await callAI(prompt, { onDelta: (_c, full) => setStreamText(full) });
        const parsed: any = extractJSON(raw);
        setResult({ type: "creative", ...parsed });
        setStatus("done");
      } catch (e) {
        console.error(e);
        setErrorMsg((e as Error).message || "生成失败，请重试");
        setStatus("error");
      }
      return;
    }
    if (scriptType === "outline") {
      if (!outlineGuestName.trim() || !outlineGuestTitle.trim()) return;
    } else if (!topic.trim()) return;
    setStatus("loading");
    setResult(null);
    try {
      let prompt = "";
      if (scriptType === "outline") {
        // 根据采访类型决定问题数量和节奏指令
        const typeConfig: Record<string, { min: number; modules: number; rhythm: string; duration: string }> = {
          "专访":     { min: 10, modules: 5, rhythm: "深度挖掘，每题深入追问，注重细节和故事性", duration: "40-60分钟" },
          "大会采访": { min: 5,  modules: 3, rhythm: "紧凑高效，直击核心，每题精准有力，节奏快", duration: "约30分钟" },
          "对谈":     { min: 8,  modules: 4, rhythm: "双方观点碰撞，注重互动与交锋，留出讨论空间", duration: "约1小时" },
          "深度访谈": { min: 15, modules: 7, rhythm: "长线深挖，从个人经历到行业洞察层层递进，节奏舒缓有张力", duration: "60-90分钟" },
        };
        const cfg = outlineType ? typeConfig[outlineType] : { min: 10, modules: 5, rhythm: "层层深入，自然过渡", duration: "不限" };

        // 让AI多生成一些以保证达标：目标比 min 多 30%，均分到每个 section
        const totalTarget = Math.ceil(cfg.min * 1.3);
        const perSection = Math.ceil(totalTarget / cfg.modules);
        const systemMsg = `你是采访提纲 JSON 生成器。严格遵守：
1. 只输出合法 JSON
2. questions 数组恰好 ${cfg.modules} 个 section
3. 每个 section 的 items 必须恰好 ${perSection} 个问题对象
4. 问题总数 = ${cfg.modules} × ${perSection} = ${totalTarget} 个
5. 不足 ${totalTarget} 个问题则为不合格输出`;

        prompt = `请为以下受访者生成采访提纲 JSON。

受访者：${outlineGuestName}
身份：${outlineGuestTitle}${outlineType ? `\n采访类型：${outlineType}（${cfg.rhythm}，时长${cfg.duration}）` : ""}${outlineExtra.trim() ? `\n补充信息：${outlineExtra}` : ""}

要求：
- questions 数组恰好 ${cfg.modules} 个 section
- 每个 section 的 items 必须恰好包含 ${perSection} 个问题（不多不少）
- 问题总数必须恰好 ${totalTarget} 个
- 问题设计：层层深入、有追问逻辑、有传播点意识、能引出金句
- 至少1-2个「感受系」追问（你当时心里是什么感觉？）
- 至少1个用「错误假设」激活深度回答的问题
- 禁止空洞收尾问（如「您有什么建议」）

输出这个 JSON 结构（不要输出其他任何内容）：
{
  "guestProfile": { "name": "姓名", "title": "职位", "company": "公司", "industry": "行业", "background": "30-50字简介", "highlights": ["标签1","标签2","标签3"] },
  "title": "【采访大纲】标题",
  "arcLine": "阶段1 → 阶段2 → 阶段3 → 阶段4",
  "questions": [
    { "section": "开场破冰", "note": "备注", "items": [{"q":"问题1","followUp":"追问","goldenQuote":"金句"},{"q":"问题2","followUp":"追问","goldenQuote":"金句"},{"q":"问题3","followUp":null,"goldenQuote":"金句"}] },
    { "section": "核心话题A", "note": "备注", "items": [{"q":"问题1","followUp":"追问","goldenQuote":"金句"},{"q":"问题2","followUp":"追问","goldenQuote":"金句"},{"q":"问题3","followUp":null,"goldenQuote":"金句"}] },
    { "section": "核心话题B", "note": "备注", "items": [{"q":"问题1","followUp":"追问","goldenQuote":"金句"},{"q":"问题2","followUp":"追问","goldenQuote":"金句"},{"q":"问题3","followUp":null,"goldenQuote":"金句"}] }
  ],
  "tips": ["建议1","建议2","建议3"]
}

重要：上面示例每个 section 恰好有 ${perSection} 个 items。你必须生成 ${cfg.modules} 个 section，每个 section 恰好 ${perSection} 个 items，总计 ${totalTarget} 个问题。`;

        const raw = await callAI(prompt, {
          system: systemMsg,
          onDelta: (_c, full) => setStreamText(full),
        });
        const parsed: any = extractJSON(raw);

        // 自动补题：如果问题总数不够，追加调用 AI 补充（最多重试3次）
        const countAllItems = (qs: any[]) => (qs || []).reduce((sum: number, s: any) => sum + (s.items || []).length, 0);
        let currentTotal = countAllItems(parsed.questions);
        let retryCount = 0;
        while (currentTotal < cfg.min && retryCount < 3) {
          retryCount++;
          const gap = cfg.min - currentTotal;
          const fillPrompt = [
            `当前采访提纲只有 ${currentTotal} 个问题，目标是 ${cfg.min} 个，还需要补充 ${gap} 个问题。`,
            '',
            '已有的模块和问题：',
            ...(parsed.questions || []).map((s: any) => `【${s.section}】${(s.items||[]).map((i: any)=>i.q).join("；")}`),
            '',
            `请补充恰好 ${gap} 个新问题。只输出 JSON 数组，格式如下：`,
            `[{"section":"归属模块名","q":"问题内容","followUp":"追问或null","goldenQuote":"≤20字金句"}]`,
            '',
            `受访者：${outlineGuestName}（${outlineGuestTitle}）`,
            '要求：不重复已有问题，只输出 JSON 数组，不输出其他任何文字。'
          ].join('\n');

          try {
            const fillRaw = await callAI(fillPrompt, { system: "只输出合法 JSON 数组，不要输出任何其他文字。" });
            const arrMatch = fillRaw.match(/\[[\s\S]*\]/);
            if (arrMatch) {
              const newItems = JSON.parse(arrMatch[0]);
              for (const item of newItems) {
                const targetSection = (parsed.questions || []).find((s: any) => s.section === item.section);
                if (targetSection) {
                  targetSection.items.push({ q: item.q, followUp: item.followUp || null, goldenQuote: item.goldenQuote || "" });
                } else {
                  parsed.questions.push({
                    section: item.section || "补充追问",
                    note: "AI 补充问题",
                    items: [{ q: item.q, followUp: item.followUp || null, goldenQuote: item.goldenQuote || "" }]
                  });
                }
              }
            }
          } catch (fillErr) {
            console.warn("补题失败:", fillErr);
          }
          currentTotal = countAllItems(parsed.questions);
        }

        setResult({ type: "outline", ...parsed });
        setStatus("done");
        return;

      } else if (scriptType === "interview") {
        // A1 商家案例采访 — video-script Skill #94313
        const hasMaterial = interviewTranscript.trim().length > 0;
        prompt = `你是专业短视频脚本创作引擎。

## 工作原则
- 旁白(VO)占比 ≤ 30%，原声(原始采访片段)占比 ≥ 70%
- 6节拍叙事框架：开场钩子→人物引出→核心冲突/数据→转折/深挖→平台价值点→收尾金句
- 金句5要素：反直觉感、画面感、情绪感、口语感、简洁感（每要素达标才算合格金句）
- 情绪曲线：好奇(0-10%)→信任(10-30%)→共鸣/冲突(30-60%)→释然/激励(60-90%)→行动驱动(90-100%)
- 平台价值点须自然带出，禁止硬植入
- 禁止编造数据，原声引用须来自素材原文

## 输入信息
【选题/视频方向】${topic}
【传播背景】${interviewBg || "商家专访系列"}${guest ? `\n【受访嘉宾】${guest}` : ""}${hasMaterial ? `\n【采访素材/转写】\n${interviewTranscript}` : ""}${angle ? `\n【核心角度/期望结论】${angle}` : ""}${platform ? `\n【发布平台】${platform}（${platform === "视频号" ? "建议3-8分钟，完播率优先，结尾引导分享" : platform === "抖音" ? "建议1-3分钟，开场3秒必须抓眼球" : platform === "小红书" ? "建议2-5分钟，情感共鸣优先" : ""}）` : ""}${account ? `\n【发布账号】${account}` : ""}

## 输出 JSON 格式（严格遵守，只输出 JSON）
{
  "title": "【专访脚本】标题（含商家名或亮点数据，≤20字）",
  "storyTag": "一句话故事标签（格式：一个[身份]在[挑战]下[做了什么][结果]）",
  "openingHook": "开场钩子（3秒内抓住眼球，优先用嘉宾金句或反常识数字，≤30字）",
  "emotionCurve": "情绪曲线描述（如：好奇→震撼→共鸣→激励）",
  "segments": [
    {
      "beat": "节拍名（开场钩子/人物引出/核心冲突/数据突破/平台价值点/收尾金句）",
      "timeCode": "时间段（如：0:00 – 0:30）",
      "type": "旁白 或 原声",
      "voiceOver": "旁白文案（type=旁白时填写，口语化，≤15字/句）",
      "originalSound": "原声引用建议（type=原声时填写，从素材中找或给方向提示，格式：「引用原文或方向提示」）",
      "shotNote": "画面/剪辑建议（景别+运镜+画面内容，1-2句）",
      "emotion": "本段情绪定位（如：悬念/温情/冲击/共鸣）"
    }
  ],
  "goldenQuotes": [
    { "quote": "金句原文", "scores": { "反直觉": 1到5的分, "画面感": 分, "情绪感": 分, "口语感": 分, "简洁感": 分 }, "usage": "建议用在哪个节拍" }
  ],
  "closingLine": "收尾语（引导观众互动，口语化，≤25字）",
  "selfCheck": { "voRatio": "旁白段数/总段数百分比", "platformValue": "平台价值点是否自然带出（是/否）", "dataVerified": "数据来自素材原文（是/否/无数据）" }
}

注意：
- segments 包含 6-8 个节拍，整体时长与【发布平台】匹配
- goldenQuotes 提炼 2-4 条，每条必须完成5维度评分
- 只输出 JSON，禁止任何解释文字`;

      } else {
        // A2 商家故事二创 — video-script Skill #94313
        const hasMaterial2 = narrationMaterial.trim().length > 0;
        prompt = `你是专业短视频脚本创作引擎。

## 输出规格
- 纯口播脚本（无原声），≤120秒，280-360字
- 写法模式：${narrationMode}
  ${narrationMode === "商业拆解型" ? "→ 结构：1句引子+3个关键动作/决策+1句结论；聚焦「他是怎么做到的」" : "→ 结构：反常识开场+爆款玩法拆解+可复制方法论+结尾种草；聚焦「为什么能爆」"}

## 内容质量要求（P0-P3传播力体系）
- P0（必须达标）：数据真实可追溯，无编造；禁用「助力/赋能/打造」等官方腔
- P1（高优先）：开场3秒有钩子（数字冲击/反常识/悬念）；每句≤15字，长短句交替
- P2（推荐）：HKR设计——H(Hook开场钩子) + K(金句至少1条) + R(Reason-to-Share分享驱动结尾)
- P3（加分）：结尾引导互动（评论/关注/转发），与账号调性匹配

## 输入信息
【视频主题/选题】${topic}${hasMaterial2 ? `\n【素材内容（报道/文章/数据）】\n${narrationMaterial}` : ""}${angle ? `\n【核心角度】${angle}` : ""}${platform ? `\n【发布平台】${platform}` : ""}${account ? `\n【发布账号】${account}` : ""}

## 输出 JSON 格式（严格遵守，只输出 JSON）
{
  "title": "【口播解读】标题（含数字或反常识词，≤20字）",
  "mode": "${narrationMode}",
  "hkr": {
    "hook": "开场钩子（0-3秒，≤20字，数字/反常识/悬念三选一）",
    "keyQuote": "全文最强金句（≤20字，有反直觉感）",
    "reasonToShare": "分享驱动结尾（为什么观众会想转发给朋友，1句话）"
  },
  "paragraphs": [
    {
      "label": "段落标签（如：开场钩子/关键动作1：xxx/关键动作2：xxx/结论/互动引导）",
      "text": "口播正文，口语化，长短句交替，每段60-80字",
      "note": "剪辑/配图建议（如：配商家实拍画面/插入数据截图/配同品类探店画面等）",
      "pLevel": "P0/P1/P2/P3（该段主要达标的传播力等级）"
    }
  ],
  "selfCheck": {
    "wordCount": "总字数",
    "hasP0Issues": "是否有P0问题（是/否，有则列出）",
    "hookStrength": "开场钩子强度（强/中/弱，弱则给出改进建议）",
    "platformNatural": "平台价值点是否自然带出（是/否/无需）"
  }
}

注意：
- paragraphs 包含 4-6 段，总字数 280-360 字
- 如有素材，数据必须来自素材原文，不得编造
- 只输出 JSON，禁止任何解释文字`;
      }

      const raw = await callAI(prompt, { onDelta: (_c, full) => setStreamText(full) });
      const parsed: any = extractJSON(raw);
      setResult({ type: scriptType, ...parsed });
      setStatus("done");
    } catch (e) {
      console.error(e);
      setErrorMsg((e as Error).message || "生成失败，请重试");
      setStatus("error");
    }
  };

  const copyAll = () => {
    if (!result) return;
    let text = result.title + "\n\n";
    if (result.type === "outline") {
      if (result.guestProfile) {
        text += `受访者：${result.guestProfile.name}（${result.guestProfile.title}）\n`;
        if (result.guestProfile.company) text += `公司/品牌：${result.guestProfile.company}\n`;
        if (result.guestProfile.industry) text += `行业：${result.guestProfile.industry}\n`;
        if (result.guestProfile.highlights?.length) text += `亮点：${result.guestProfile.highlights.join(" / ")}\n`;
        text += "\n";
      }
      if (result.arcLine) text += `叙事弧线：${result.arcLine}\n\n`;
      const sections = result.questions || result.sections || [];
      sections.forEach((s: any) => {
        text += `【${s.section}】\n`;
        if (s.note) text += `备注：${s.note}\n`;
        const items = s.items || s.questions?.map((q: any) => ({ q, refAnswers: [], goldenQuote: "", followUp: null })) || [];
        items.forEach((item: any, i: number) => {
          const qText = typeof item === "string" ? item : item.q;
          text += `  Q${i + 1}. ${qText}\n`;
          if (item.goldenQuote) text += `       预设金句：「${item.goldenQuote}」\n`;
          if (item.followUp)    text += `       追问：${item.followUp}\n`;
          if (item.refAnswers?.length) text += `       参考方向：${item.refAnswers.join(" / ")}\n`;
        });
        text += "\n";
      });
      if (result.tips) {
        text += "采访注意事项：\n";
        result.tips.forEach((t: any, i: number) => text += `  ${i + 1}. ${t}\n`);
      }
    } else if (result.type === "interview") {
      if (result.storyTag) text += `故事标签：${result.storyTag}\n`;
      if (result.emotionCurve) text += `情绪曲线：${result.emotionCurve}\n\n`;
      if (result.openingHook) text += `开场钩子：${result.openingHook}\n\n`;
      const segs = result.segments || result.outline || [];
      segs.forEach((s: any, i: number) => {
        if (s.questions) {
          text += `【${s.section || s.beat}】${s.timeCode ? " " + s.timeCode : ""}\n`;
          s.questions.forEach((q: any, qi: number) => text += `  Q${qi + 1}. ${q}\n`);
        } else {
          text += `【${s.beat || s.section}】 ${s.timeCode || ""} [${s.type || ""}]\n`;
          if (s.voiceOver) text += `  VO：${s.voiceOver}\n`;
          if (s.originalSound) text += `  原声：${s.originalSound}\n`;
          if (s.shotNote) text += `  画面：${s.shotNote}\n`;
        }
        text += "\n";
      });
      if (result.goldenQuotes && result.goldenQuotes.length > 0) {
        text += "金句提炼：\n";
        result.goldenQuotes.forEach((gq: any, i: number) => {
          text += `  ${i + 1}. 「${gq.quote}」`;
          if (gq.scores) text += " (" + Object.entries(gq.scores).map(([k, v]) => `${k}:${v}`).join(", ") + ")";
          text += "\n";
        });
        text += "\n";
      }
      if (result.closingLine) text += `收尾语：${result.closingLine}\n`;
      if (result.selfCheck) {
        text += `\n自检：旁白占比 ${result.selfCheck.voRatio || "-"} / 平台价值点 ${result.selfCheck.platformValue || "-"} / 数据核实 ${result.selfCheck.dataVerified || "-"}\n`;
      }
    } else if (result.type === "narration") {
      if (result.hook) text += `开场钩子：${result.hook}\n\n`;
      result.paragraphs.forEach((p: any) => {
        text += `【${p.label}】\n${p.text}\n备注：${p.note}\n\n`;
      });
    } else if (result.type === "creative") {
      if (result.summary) text += `简介：${result.summary}\n视频形式：${result.videoForm} | 时长：${result.videoDuration}\n\n`;
      result.beats.forEach((b: any, i: number) => {
        text += `Beat ${i + 1}  ${b.beatName}  ${b.timeCode}\n`;
        text += `VO：${b.vo}\n`;
        text += `画面：${b.shotDesc}\n`;
        text += `花字：${b.subtitle}\n\n`;
      });
    }
    navigator.clipboard.writeText(text);
  };

  const currentType = SCRIPT_TYPES.find(t => t.value === scriptType);

  return (
    <>
      <AISettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* 页头 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFD100" }}>
            <ScrollText className="w-[18px] h-[18px] text-gray-900" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">脚本生成器</h1>
            <p className="text-xs text-gray-400 mt-0.5">输入基本信息，AI 自动生成结构化脚本与采访提纲</p>
          </div>
          {/* AI 模型状态 / 设置入口 */}
          <button
            onClick={() => setShowSettings(true)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
              aiReady
                ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${aiReady ? "bg-green-500" : "bg-amber-500"}`}
            />
            <span className="max-w-[190px] truncate">{aiLabel || "未配置"}</span>
            <Settings2 className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>

        {/* 未配置 API Key 的引导 */}
        {!aiReady && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50 px-4 py-3 shadow-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="flex-1 text-sm text-amber-800">
              还没有配置 AI 模型。点击右上角按钮，选择 DeepSeek / 通义千问 / Kimi / 智谱
              任一服务并填入你自己的 API Key 即可开始使用。Key 只存在本机浏览器里。
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
            >
              去配置
            </button>
          </div>
        )}

        {/* 来自热点的预填提示条 */}
        {fromHotspot && topic && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              已从热点「<span className="font-semibold">{topic.length > 30 ? topic.slice(0, 30) + "…" : topic}</span>」自动预填，正在生成脚本…
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── 左侧输入 ── */}
          <div className="lg:col-span-5 space-y-4">

            {/* 类型选择 — 紧凑横向 Tab */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-4 border-b border-gray-100">
                {SCRIPT_TYPES.map(t => {
                  const Icon = t.icon;
                  const active = scriptType === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => { setScriptType(t.value); setResult(null); setStatus("idle"); }}
                      className={`relative flex flex-col items-center gap-1.5 py-3.5 px-2 text-center transition-all ${
                        active ? "bg-amber-50" : "hover:bg-gray-50"
                      }`}
                    >
                      {active && <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: "#FFD100" }} />}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        active ? "" : "bg-gray-100"
                      }`} style={active ? { background: "#FFD100" } : {}}>
                        <Icon className={`w-4 h-4 ${active ? "text-gray-900" : "text-gray-400"}`} />
                      </div>
                      <span className={`text-xs font-semibold leading-tight ${active ? "text-amber-700" : "text-gray-500"}`}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* 当前类型描述 */}
              <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100">
                <p className="text-xs text-gray-500 text-center">{currentType?.desc}</p>
              </div>

              {/* 参数输入区域 */}
              <div className="p-4 space-y-3.5">

                {scriptType === "creative" ? (
                  /* ── 创意视频专属表单 ── */
                  <>
                    {/* 传播背景 */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">传播背景<span className="text-red-400 ml-0.5">*</span></Label>
                      <Textarea
                        placeholder="例如：某本地生活平台品牌升级campaign，希望传达深夜陪伴的情感价值，目标受众为一线城市25-35岁加班族"
                        value={creativeBg}
                        onChange={e => setCreativeBg(e.target.value)}
                        className="min-h-[72px] resize-none text-sm"
                      />
                    </div>

                    {/* 创意方向 */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">创意方向<span className="text-red-400 ml-0.5">*</span></Label>
                      <Textarea
                        placeholder="例如：以一个深夜加班的年轻人视角，通过一份外卖传递城市温度"
                        value={creativeDir}
                        onChange={e => setCreativeDir(e.target.value)}
                        className="min-h-[64px] resize-none text-sm"
                      />
                    </div>

                    {/* 视频形式 */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">视频形式<span className="text-red-400 ml-0.5">*</span></Label>
                      <div className="flex flex-wrap gap-1.5">
                        {CREATIVE_VIDEO_FORMS.map(f => (
                          <button key={f} onClick={() => setCreativeForm(f)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              creativeForm === f ? "border-transparent text-gray-900" : "border-gray-200 text-gray-500"
                            }`}
                            style={creativeForm === f ? { background: "#FFD100" } : {}}>
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 视频时长 */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">视频时长<span className="text-red-400 ml-0.5">*</span></Label>
                      <div className="flex flex-wrap gap-1.5">
                        {CREATIVE_DURATIONS.map(d => (
                          <button key={d} onClick={() => setCreativeDur(d)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              creativeDur === d ? "border-transparent text-gray-900" : "border-gray-200 text-gray-500"
                            }`}
                            style={creativeDur === d ? { background: "#FFD100" } : {}}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 视频风格（可选） */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-600">视频风格<span className="text-gray-300 ml-1 text-xs font-normal">可选</span></Label>
                      <div className="flex flex-wrap gap-1.5">
                        {CREATIVE_STYLES.map(s => (
                          <button key={s} onClick={() => setCreativeStyle((prev: string) => prev === s ? "" : s)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              creativeStyle === s ? "border-transparent text-gray-900" : "border-gray-200 text-gray-500"
                            }`}
                            style={creativeStyle === s ? { background: "#FFD100" } : {}}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 平台 + 账号 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">目标平台</Label>
                        <div className="flex flex-wrap gap-1">
                          {PLATFORMS.map(p => (
                            <button key={p} onClick={() => setPlatform(p)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                platform === p ? "border-transparent text-gray-900" : "border-gray-200 text-gray-500"
                              }`}
                              style={platform === p ? { background: "#FFD100" } : {}}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">发布账号</Label>
                        <select
                          value={account}
                          onChange={e => setAccount(e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                        >
                          <option value="">不限账号</option>
                          {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                ) : scriptType === "outline" ? (
                  /* ── 采访大纲表单（简化：姓名+Title+选填补充） ── */
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        受访者姓名 <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        placeholder="例如：张三"
                        value={outlineGuestName}
                        onChange={e => setOutlineGuestName(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <BriefcaseBusiness className="w-3.5 h-3.5 text-gray-400" />
                        Title / 身份 <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        placeholder="例如：XX品牌创始人 / XX连锁餐饮CEO"
                        value={outlineGuestTitle}
                        onChange={e => setOutlineGuestTitle(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    {/* 采访类型（可选） */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                        <Mic2 className="w-3.5 h-3.5 text-gray-400" />
                        采访类型
                        <span className="text-xs text-gray-300 ml-1 font-normal">可选</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {OUTLINE_INTERVIEW_TYPES.map(t => (
                          <button key={t.value} onClick={() => setOutlineType((prev: string) => prev === t.value ? "" : t.value)}
                            className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all ${
                              outlineType === t.value ? "border-amber-300 shadow-sm" : "border-gray-200 hover:border-gray-300"
                            }`}
                            style={outlineType === t.value ? { background: "#FFFBEB" } : {}}>
                            <span className={`text-xs font-semibold ${outlineType === t.value ? "text-amber-700" : "text-gray-700"}`}>{t.value}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-300" />
                        补充信息
                        <span className="text-xs text-gray-300 ml-1">选填</span>
                      </Label>
                      <Textarea
                        placeholder="可补充：采访背景、希望挖掘的方向、品牌规模、近期热点事件等"
                        value={outlineExtra}
                        onChange={e => setOutlineExtra(e.target.value)}
                        className="min-h-[72px] resize-none text-sm"
                      />
                    </div>
                  </>
                ) : scriptType === "interview" ? (
                  /* ── A1 专访脚本表单（video-script Skill #94313）── */
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">选题 / 视频方向<span className="text-red-400 ml-0.5">*</span></Label>
                      <Input
                        placeholder="例如：618大促商家备战，聚焦餐饮赛道"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        采访转写 / 素材
                        <span className="text-xs text-gray-400 ml-1.5 font-normal">粘贴后 AI 会直接从原声里提炼金句</span>
                      </Label>
                      <Textarea
                        placeholder={"粘贴采访录音转写、采访记录或关键对话素材...\n\n示例：\n主持人：今年618你们的GMV是多少？\n老板：破了我们开业以来的记录，那天系统预警我以为出bug了。"}
                        value={interviewTranscript}
                        onChange={e => setInterviewTranscript(e.target.value)}
                        className="min-h-[110px] resize-none text-sm"
                      />
                      <p className="text-xs text-gray-400">{interviewTranscript.length} 字{interviewTranscript.length === 0 ? "（无素材也可生成，AI将基于选题方向构建）" : ""}</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">受访嘉宾背景<span className="text-xs text-gray-400 ml-1 font-normal">可选</span></Label>
                      <Input
                        placeholder="例如：连锁餐饮品牌CEO，管理70家门店"
                        value={guest}
                        onChange={e => setGuest(e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">传播背景<span className="text-xs text-gray-400 ml-1 font-normal">可选</span></Label>
                      <Input
                        placeholder="例如：商家故事系列，618节点配合传播"
                        value={interviewBg}
                        onChange={e => setInterviewBg(e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">发布平台</Label>
                        <div className="flex flex-wrap gap-1">
                          {PLATFORMS.map(p => (
                            <button key={p} onClick={() => setPlatform(p)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${platform === p ? "border-transparent text-gray-900" : "border-gray-200 text-gray-500"}`}
                              style={platform === p ? { background: "#FFD100" } : {}}>{p}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">发布账号</Label>
                        <select value={account} onChange={e => setAccount(e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs">
                          <option value="">不限账号</option>
                          {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── A2 口播解读表单（video-script Skill #94313）── */
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">视频主题<span className="text-red-400 ml-0.5">*</span></Label>
                      <Input
                        placeholder="例如：一家餐饮小店线上逆袭的故事"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        报道 / 文章 / 数据素材
                        <span className="text-xs text-gray-400 ml-1.5 font-normal">粘贴后更精准</span>
                      </Label>
                      <Textarea
                        placeholder={"粘贴已有的报道、文章、数据或案例详情...\n\n示例：\n某重庆火锅店，2023年开始做线上，首月新增线上订单200+，半年后月流水从3万增至9万，老板说「以前靠回头客，现在靠新客变回头客」。"}
                        value={narrationMaterial}
                        onChange={e => setNarrationMaterial(e.target.value)}
                        className="min-h-[110px] resize-none text-sm"
                      />
                      <p className="text-xs text-gray-400">{narrationMaterial.length} 字{narrationMaterial.length === 0 ? "（无素材也可生成，AI将基于主题发挥）" : ""}</p>
                    </div>

                    {/* 写法模式 */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">写法模式</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["商业拆解型", "爆款玩法型"].map(m => (
                          <button key={m} onClick={() => setNarrationMode(m)}
                            className={`px-3 py-2.5 rounded-xl border text-left transition-all ${narrationMode === m ? "border-amber-300 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
                            style={narrationMode === m ? { background: "#FFFBEB" } : {}}>
                            <span className={`text-xs font-semibold block ${narrationMode === m ? "text-amber-700" : "text-gray-700"}`}>{m}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 block leading-tight">
                              {m === "商业拆解型" ? "他是怎么做到的 · 聚焦关键决策" : "为什么能爆 · 可复制方法论"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">核心角度<span className="text-xs text-gray-400 ml-1 font-normal">可选</span></Label>
                      <Textarea
                        placeholder="例如：以数据切入，观点鲜明，结尾引导评论互动"
                        value={angle}
                        onChange={e => setAngle(e.target.value)}
                        className="min-h-[56px] resize-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">发布平台</Label>
                        <div className="flex flex-wrap gap-1">
                          {PLATFORMS.map(p => (
                            <button key={p} onClick={() => setPlatform(p)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${platform === p ? "border-transparent text-gray-900" : "border-gray-200 text-gray-500"}`}
                              style={platform === p ? { background: "#FFD100" } : {}}>{p}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">发布账号</Label>
                        <select value={account} onChange={e => setAccount(e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs">
                          <option value="">不限账号</option>
                          {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  className="w-full h-11 font-semibold text-gray-900 rounded-xl text-sm shadow-sm hover:shadow-md transition-shadow"
                  style={{ background: "#FFD100" }}
                  onClick={handleGenerate}
                  disabled={
                    status === "loading" ||
                    (scriptType === "creative"
                      ? (!creativeBg.trim() || !creativeDir.trim())
                      : scriptType === "outline"
                        ? (!outlineGuestName.trim() || !outlineGuestTitle.trim())
                        : !topic.trim())
                  }
                >
                  {status === "loading"
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI 正在生成...</>
                    : <><Sparkles className="w-4 h-4 mr-2" />生成{currentType?.label}</>}
                </Button>
              </div>
            </div>
          </div>

          {/* ── 右侧结果 ── */}
          <div className="lg:col-span-7">
            {status === "idle" && !result && (
              <div className="border border-gray-200 border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[520px] text-gray-400 bg-gradient-to-b from-white to-gray-50/50">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <ScrollText className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">填写左侧参数，生成专业脚本</p>
                <p className="text-xs text-gray-400 mt-1">支持采访大纲、专访脚本、口播解读、创意视频脚本</p>
                <div className="flex gap-2 mt-5">
                  {SCRIPT_TYPES.map(t => {
                    const Icon = t.icon;
                    const active = scriptType === t.value;
                    return (
                      <button key={t.value} onClick={() => setScriptType(t.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          active ? "border-amber-300 text-amber-700 bg-amber-50" : "border-gray-200 text-gray-500 hover:border-amber-200 hover:text-amber-600"
                        }`}>
                        <Icon className="w-3.5 h-3.5" />{t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {status === "loading" && (
              <div className="border border-amber-200 rounded-2xl min-h-[520px] bg-gradient-to-b from-amber-50 to-orange-50/50 p-6 flex flex-col">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                    <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
                  </div>
                  <p className="text-sm text-amber-700 font-semibold">AI 正在生成{currentType?.label}...</p>
                  <p className="text-xs text-amber-500 mt-1.5">
                    {streamText ? `已生成 ${streamText.length} 字` : "分析选题方向，构建叙事结构"}
                  </p>
                </div>
                {/* 流式输出实时预览 */}
                {streamText && (
                  <div className="mt-5 flex-1 overflow-auto rounded-xl border border-amber-200/70 bg-white/70 p-3">
                    <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-gray-500">
                      {streamText.slice(-1500)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="border border-red-200 rounded-2xl flex flex-col items-center justify-center min-h-[520px] bg-red-50/50 px-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-sm font-semibold text-red-700">生成失败</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-red-600">{errorMsg}</p>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => { setStatus("idle"); setErrorMsg(""); }}
                    className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    返回
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    检查 AI 设置
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-gray-800"
                  >
                    重试
                  </button>
                </div>
              </div>
            )}

            {status === "done" && result && (
              <div className="space-y-4">
                {/* 结果顶栏 */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Badge style={{ background: "#FFD100", color: "#78600A" }} className="text-xs shrink-0 rounded-lg px-2.5 py-1">
                      {currentType?.label}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-800 truncate">{result.title}</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0 rounded-lg ml-3" onClick={copyAll}>
                    <Copy className="w-3.5 h-3.5" />复制全部
                  </Button>
                </div>

                {/* 专访脚本 A1 — video-script Skill #94313 */}
                {result.type === "interview" && (
                  <div className="space-y-3">
                    {/* 故事标签 + 情绪曲线 */}
                    {(result.storyTag || result.emotionCurve) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
                        {result.storyTag && (
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 shrink-0 mt-0.5">故事标签</span>
                            <p className="text-sm text-amber-900 font-medium leading-snug">{result.storyTag}</p>
                          </div>
                        )}
                        {result.emotionCurve && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 shrink-0">情绪曲线</span>
                            <p className="text-xs text-amber-700">{result.emotionCurve}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 开场钩子 */}
                    {result.openingHook && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                        <span className="text-xs font-bold text-red-600 shrink-0 mt-0.5 bg-red-100 px-1.5 py-0.5 rounded">开场钩子</span>
                        <p className="text-sm text-red-800 leading-relaxed flex-1 italic font-medium">「{result.openingHook}」</p>
                        <CopyBtn text={result.openingHook} />
                      </div>
                    )}

                    {/* 节拍列表（原声/旁白分类）*/}
                    {(result.segments || result.outline || []).map((s: any, i: number) => {
                      // 兼容旧格式 outline
                      if (s.questions) {
                        return (
                          <CollapsibleSection key={i} title={s.section || s.beat} badge={i + 1} timeCode={s.timeCode}>
                            {s.questions.map((q: any, qi: number) => (
                              <div key={qi} className="px-4 py-2.5 flex items-start gap-3 hover:bg-amber-50 transition-colors">
                                <span className="text-xs font-bold text-amber-500 mt-0.5 shrink-0">Q{qi + 1}</span>
                                <p className="text-sm text-gray-700 leading-relaxed flex-1">{q}</p>
                                <CopyBtn text={q} />
                              </div>
                            ))}
                          </CollapsibleSection>
                        );
                      }
                      const isOriginal = s.type === "原声";
                      return (
                        <CollapsibleSection key={i} title={s.beat || s.section} badge={i + 1} timeCode={s.timeCode}>
                          {/* 类型标签行 */}
                          <div className={`px-4 py-1.5 flex items-center gap-2 border-b border-gray-100 ${isOriginal ? "bg-green-50" : "bg-blue-50"}`}>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isOriginal ? "bg-green-200 text-green-800" : "bg-blue-200 text-blue-800"}`}>
                              {isOriginal ? "原声" : "旁白VO"}
                            </span>
                            {s.emotion && <span className="text-[10px] text-gray-500 italic">{s.emotion}</span>}
                          </div>
                          {/* 旁白 VO */}
                          {s.voiceOver && (
                            <div className="px-4 py-2.5 flex items-start gap-3 bg-blue-50/50">
                              <span className="text-blue-600 bg-blue-100 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 mt-0.5">VO</span>
                              <p className="text-sm text-gray-700 leading-relaxed flex-1 italic">{s.voiceOver}</p>
                              <CopyBtn text={s.voiceOver} />
                            </div>
                          )}
                          {/* 原声引用 */}
                          {s.originalSound && (
                            <div className="px-4 py-2.5 flex items-start gap-3 bg-green-50/50">
                              <span className="text-green-600 bg-green-100 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 mt-0.5">原声</span>
                              <p className="text-sm text-gray-700 leading-relaxed flex-1">{s.originalSound}</p>
                              <CopyBtn text={s.originalSound} />
                            </div>
                          )}
                          {/* 画面/剪辑备注 */}
                          {s.shotNote && (
                            <div className="px-4 py-2 flex items-start gap-2 bg-gray-50">
                              <span className="text-[10px] font-bold text-gray-500 shrink-0 mt-0.5">画面</span>
                              <p className="text-xs text-gray-500 leading-relaxed">{s.shotNote}</p>
                            </div>
                          )}
                        </CollapsibleSection>
                      );
                    })}

                    {/* 金句卡片（5维度评分）*/}
                    {result.goldenQuotes && result.goldenQuotes.length > 0 && (
                      <div className="border border-yellow-200 bg-yellow-50 rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-yellow-200 bg-yellow-100 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                          <span className="text-xs font-bold text-yellow-800">金句提炼（5维度评分）</span>
                        </div>
                        <div className="divide-y divide-yellow-100">
                          {result.goldenQuotes.map((gq: any, i: number) => (
                            <div key={i} className="px-4 py-3">
                              <div className="flex items-start gap-2 mb-2">
                                <p className="text-sm text-gray-900 font-semibold flex-1 italic">「{gq.quote}」</p>
                                <CopyBtn text={gq.quote} />
                              </div>
                              {gq.scores && (
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                  {Object.entries(gq.scores).map(([k, v]) => (
                                    <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${Number(v) >= 4 ? "bg-green-50 border-green-200 text-green-700" : Number(v) >= 3 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                                      {k} {String(v)}分
                                    </span>
                                  ))}
                                </div>
                              )}
                              {gq.usage && <p className="text-[10px] text-gray-400">建议用在：{gq.usage}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 收尾语 */}
                    {result.closingLine && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
                        <span className="text-xs font-bold text-blue-600 shrink-0 mt-0.5">收尾语</span>
                        <p className="text-sm text-blue-800 leading-relaxed flex-1">{result.closingLine}</p>
                        <CopyBtn text={result.closingLine} />
                      </div>
                    )}

                    {/* 自检 + 来源 */}
                    {result.selfCheck && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-1.5">
                        <p className="text-xs font-bold text-gray-500 mb-1">📋 自检报告</p>
                        {[["旁白占比", result.selfCheck.voRatio], ["平台价值点自然带出", result.selfCheck.platformValue], ["数据来源核实", result.selfCheck.dataVerified]].map(([k, v]) => (
                          <div key={k} className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400 w-24 shrink-0">{k}</span>
                            <span className={`font-medium ${String(v).includes("是") || String(v).includes("无数据") ? "text-green-600" : "text-amber-600"}`}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-400 px-1 pt-1">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>AI 生成（短视频脚本创作引擎） · A1商家案例采访 · 旁白≤30% 原声≥70%</span>
                    </div>
                  </div>
                )}

                {/* 采访大纲 */}
                {result.type === "outline" && (
                  <div className="space-y-3">
                    {/* 嘉宾资料卡 */}
                    {result.guestProfile && (
                      <div className="bg-gradient-to-r from-gray-50 to-amber-50 border border-gray-200 rounded-xl px-5 py-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-bold text-gray-900">{result.guestProfile.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{result.guestProfile.title}</span>
                            </div>
                            {result.guestProfile.background && (
                              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{result.guestProfile.background}</p>
                            )}
                            {result.guestProfile.highlights && result.guestProfile.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {result.guestProfile.highlights.map((h: any, i: number) => (
                                  <span key={i} className="text-[11px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-500">{h}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 叙事弧线 */}
                    {result.arcLine && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1.5">
                        <span className="text-xs font-bold text-amber-600">叙事弧线</span>
                        <p className="text-sm text-amber-800 leading-relaxed font-medium">{result.arcLine}</p>
                      </div>
                    )}

                    {/* 问题列表 */}
                {(result.questions || result.sections || []).map((s: any, i: number) => {
                  const items = s.items || (s.questions || []).map((q: any) => ({ q, refAnswers: [], goldenQuote: null, followUp: null }));
                      return (
                        <CollapsibleSection key={i} title={s.section} badge={i + 1}>
                          {/* 模块备注 */}
                          <div className="px-4 py-2 bg-blue-50 border-b border-gray-100">
                            <p className="text-xs text-blue-600 flex items-start gap-1.5">
                              <span className="font-bold shrink-0 mt-0.5">📌</span>{s.note}
                            </p>
                          </div>
                          {items.map((item: any, qi: number) => {
                            const qText = typeof item === "string" ? item : item.q;
                            return (
                              <div key={qi} className="border-b border-gray-100 last:border-b-0">
                                {/* 主问题 */}
                                <div className="px-4 py-2.5 flex items-start gap-3 hover:bg-amber-50 transition-colors">
                                  <span className="text-xs font-bold text-amber-500 mt-0.5 shrink-0 w-6">Q{qi + 1}</span>
                                  <p className="text-sm text-gray-800 leading-relaxed flex-1 font-medium">{qText}</p>
                                  <CopyBtn text={qText} />
                                </div>
                                {/* 预设金句 */}
                                {item.goldenQuote && (
                                  <div className="px-4 py-2 flex items-start gap-3 bg-yellow-50">
                                    <span className="text-[10px] font-bold text-yellow-600 bg-yellow-200 rounded px-1.5 py-0.5 shrink-0 mt-0.5">金句</span>
                                    <p className="text-xs text-yellow-800 italic flex-1">「{item.goldenQuote}」</p>
                                    <CopyBtn text={item.goldenQuote} />
                                  </div>
                                )}
                                {/* 追问 */}
                                {item.followUp && (
                                  <div className="px-4 py-2 flex items-start gap-3 bg-purple-50">
                                    <span className="text-[10px] font-bold text-purple-600 bg-purple-100 rounded px-1.5 py-0.5 shrink-0 mt-0.5">追问</span>
                                    <p className="text-xs text-purple-800 flex-1">{item.followUp}</p>
                                    <CopyBtn text={item.followUp} />
                                  </div>
                                )}
                                {/* 参考回答方向 */}
                                {item.refAnswers && item.refAnswers.length > 0 && (
                                  <div className="px-4 py-2 bg-gray-50 flex items-start gap-2">
                                    <span className="text-[10px] font-bold text-gray-500 shrink-0 mt-0.5">参考方向</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {item.refAnswers.map((r: any, ri: number) => (
                                        <span key={ri} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-500">{r}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </CollapsibleSection>
                      );
                    })}

                    {/* 采访注意事项 */}
                    {result.tips && result.tips.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-1.5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">⚠️ 采访执行建议</p>
                        {result.tips.map((tip: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold shrink-0 text-[10px]">{i + 1}</span>
                            {tip}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 来源标注 */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 px-1 pt-1">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>AI 生成（采访提纲生成专家） · 基于121条方法论 · 脚本思维设计问题链</span>
                    </div>
                  </div>
                )}

                {/* 口播解读 A2 — video-script Skill #94313 */}
                {result.type === "narration" && (
                  <div className="space-y-3">
                    {/* HKR 分析卡 */}
                    {result.hkr && (
                      <div className="border border-indigo-200 bg-indigo-50 rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-indigo-200 bg-indigo-100 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-bold text-indigo-800">HKR 传播力设计</span>
                          {result.mode && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-700 font-medium ml-auto">{result.mode}</span>}
                        </div>
                        <div className="divide-y divide-indigo-100">
                          {result.hkr.hook && (
                            <div className="px-4 py-2.5 flex items-start gap-3">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-200 text-red-800 shrink-0 mt-0.5">H 钩子</span>
                              <p className="text-sm text-gray-800 flex-1 italic font-medium">「{result.hkr.hook}」</p>
                              <CopyBtn text={result.hkr.hook} />
                            </div>
                          )}
                          {result.hkr.keyQuote && (
                            <div className="px-4 py-2.5 flex items-start gap-3">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-200 text-yellow-800 shrink-0 mt-0.5">K 金句</span>
                              <p className="text-sm text-gray-800 flex-1 italic">「{result.hkr.keyQuote}」</p>
                              <CopyBtn text={result.hkr.keyQuote} />
                            </div>
                          )}
                          {result.hkr.reasonToShare && (
                            <div className="px-4 py-2.5 flex items-start gap-3">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-200 text-green-800 shrink-0 mt-0.5">R 分享驱动</span>
                              <p className="text-sm text-gray-600 flex-1">{result.hkr.reasonToShare}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 段落列表 */}
                    {(result.paragraphs || []).map((p: any, i: number) => {
                      const pColor: Record<string, string> = { P0: "bg-red-100 text-red-700 border-red-200", P1: "bg-orange-100 text-orange-700 border-orange-200", P2: "bg-blue-100 text-blue-700 border-blue-200", P3: "bg-green-100 text-green-700 border-green-200" };
                      return (
                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-gray-900 shrink-0"
                                style={{ background: "#FFD100" }}>{i + 1}</span>
                              <span className="text-sm font-semibold text-gray-700">{p.label}</span>
                              {p.pLevel && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${pColor[p.pLevel] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                  {p.pLevel}
                                </span>
                              )}
                            </div>
                            <CopyBtn text={p.text} />
                          </div>
                          <div className="px-4 py-3 space-y-2">
                            <p className="text-sm text-gray-800 leading-relaxed">{p.text}</p>
                            {p.note && (
                              <p className="text-xs text-gray-400 flex items-start gap-1">
                                <span className="font-medium text-gray-500 shrink-0">📝</span>{p.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* 自检报告 */}
                    {result.selfCheck && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-1.5">
                        <p className="text-xs font-bold text-gray-500 mb-1">📋 自检报告</p>
                        {[
                          ["总字数", result.selfCheck.wordCount],
                          ["P0问题", result.selfCheck.hasP0Issues],
                          ["钩子强度", result.selfCheck.hookStrength],
                          ["平台价值点", result.selfCheck.platformNatural],
                        ].map(([k, v]) => v && (
                          <div key={k} className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400 w-20 shrink-0">{k}</span>
                            <span className={`font-medium ${String(v).includes("否") || String(v).includes("弱") ? "text-amber-600" : "text-green-600"}`}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-400 px-1 pt-1">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>AI 生成（短视频脚本创作引擎） · A2商家故事二创 · {result.mode || "口播脚本"} · HKR传播力设计</span>
                    </div>
                  </div>
                )}

                {/* ── 创意视频脚本结果 ── */}
                {result.type === "creative" && (
                  <div className="space-y-3">
                    {/* 创意概述卡片 */}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5 text-purple-500" />
                              <span className="text-xs font-bold text-purple-600">创意概述</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full border border-purple-300 text-[10px] font-semibold text-purple-600">
                              {result.videoForm}
                            </span>
                            <span className="px-2 py-0.5 rounded-full border border-purple-300 text-[10px] font-semibold text-purple-600">
                              {result.videoDuration}
                            </span>
                          </div>
                          <p className="text-sm text-purple-900 leading-relaxed">{result.summary}</p>
                        </div>
                        <CopyBtn text={result.summary} />
                      </div>
                    </div>

                    {/* Beat Sheet 节拍列表 */}
                    {result.beats.map((beat: any, i: number) => (
                      <CollapsibleSection
                        key={i}
                        title={beat.beatName}
                        badge={i + 1}
                        timeCode={beat.timeCode}
                        defaultOpen={i === 0}
                      >
                        {/* VO 行 */}
                        <div className="px-4 py-2.5 flex items-start gap-3">
                          <span className="text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 mt-0.5">VO</span>
                          <p className="text-sm text-gray-700 leading-relaxed flex-1 italic">{beat.vo}</p>
                          <CopyBtn text={beat.vo} />
                        </div>
                        {/* 画面行 */}
                        <div className="px-4 py-2.5 flex items-start gap-3">
                          <span className="text-green-600 bg-green-50 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 mt-0.5">画面</span>
                          <p className="text-sm text-gray-700 leading-relaxed flex-1">{beat.shotDesc}</p>
                          <CopyBtn text={beat.shotDesc} />
                        </div>
                        {/* 花字行（有值才显示） */}
                        {beat.subtitle && (
                          <div className="px-4 py-2.5 flex items-start gap-3">
                            <span className="text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 mt-0.5">花字</span>
                            <p className="text-sm text-gray-800 leading-relaxed flex-1 font-semibold">「{beat.subtitle}」</p>
                            <CopyBtn text={beat.subtitle} />
                          </div>
                        )}
                      </CollapsibleSection>
                    ))}

                    {/* 底部来源标注 */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 px-1 pt-1">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>AI 生成（创意视频脚本） · Save the Cat Beat Sheet 结构</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

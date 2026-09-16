"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, Film, BookOpen, ArrowUpRight, Copy, Check } from "lucide-react";

type Tool = { name: string; region: "海外" | "国内" | "内部"; desc: string; color: string };

const IMAGE_TOOLS: Tool[] = [
  { name: "ChatGPT Image 2.0", region: "海外", desc: "语义理解强，适合复杂场景与文字海报类图片生成", color: "#10A37F" },
  { name: "Gemini Imagen", region: "海外", desc: "写实质感出色，人物与美食细节表现稳定", color: "#4285F4" },
  { name: "豆包 AI 绘图", region: "国内", desc: "中文提示词友好，出图速度快，风格模板丰富", color: "#325AB4" },
  { name: "灵境 AI 绘图", region: "内部", desc: "内部图像生成平台，支持品牌视觉规范与批量出图", color: "#FFD100" },
];

const VIDEO_TOOLS: Tool[] = [
  { name: "Runway Gen-4", region: "海外", desc: "图生视频运动控制精细，适合电影感镜头", color: "#6B4FBB" },
  { name: "Pika 2.0", region: "海外", desc: "特效与风格化能力强，玩法轻快", color: "#E8608A" },
  { name: "即梦 AI", region: "国内", desc: "中文场景理解好，电商与生活类素材表现稳定", color: "#1F6FEB" },
  { name: "可灵 AI", region: "国内", desc: "长镜头连贯性好，适合人物口播与探店类视频", color: "#0FA968" },
];

const PROMPT_LIBRARY = [
  { tag: "探店", title: "烟火气小店开场", prompt: "清晨阳光斜照进街边小店，蒸汽从锅中升起，店主忙碌的侧影，手持镜头缓慢推进，胶片质感，暖色调" },
  { tag: "美食", title: "食物特写镜头", prompt: "微距特写：热油浇在食物表面的瞬间，油花四溅慢动作，浅景深，背景虚化为暖色光斑" },
  { tag: "人物", title: "店主故事感肖像", prompt: "中年店主站在店门口微笑，身后是手写招牌，逆光轮廓，纪实摄影风格，真实皮肤质感" },
  { tag: "活动", title: "节日氛围转场", prompt: "夜市灯笼渐次亮起，人群穿梭延时摄影，暖黄与红色为主调，结尾定格在招牌上" },
  { tag: "城市", title: "城市日出航拍", prompt: "无人机航拍城市日出，晨光穿过楼宇，街道逐渐苏醒，缓慢上升镜头，大气透视" },
  { tag: "教程", title: "步骤分解画面", prompt: "俯拍桌面，双手分步骤操作，每一步画面左侧出现简洁文字标签，明亮均匀光线" },
];

const TABS = [
  { id: "image", label: "AI 图片生成", icon: ImageIcon },
  { id: "video", label: "图生视频", icon: Film },
  { id: "prompts", label: "提示词库", icon: BookOpen },
] as const;

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
          style={{ background: tool.color, color: tool.color === "#FFD100" ? "#1F2937" : "#fff" }}>
          {tool.name.slice(0, 1)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{tool.name}</h3>
            <span className={tool.region === "内部"
              ? "rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-900"
              : "rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"}
              style={tool.region === "内部" ? { background: "#FFF3C4" } : {}}>{tool.region}</span>
          </div>
        </div>
      </div>
      <p className="flex-1 text-sm leading-6 text-gray-500">{tool.desc}</p>
      <button className="mt-4 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 hover:brightness-95" style={{ background: "#FFD100" }}>
        立即使用 <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function MeijingPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("image");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (title: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(title);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFD100" }}>
          <Sparkles className="h-5 w-5 text-gray-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI 创作工具箱</h1>
          <p className="mt-0.5 text-sm text-gray-500">精选图像与视频生成工具，附高频场景提示词</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        作品集演示：工具入口与提示词均为示例展示，不跳转到真实服务。
      </div>

      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={tab === t.id ? "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium text-gray-900" : "flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 border border-gray-100"}
            style={tab === t.id ? { background: "#FFD100" } : {}}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab !== "prompts" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(tab === "image" ? IMAGE_TOOLS : VIDEO_TOOLS).map((t) => <ToolCard key={t.name} tool={t} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMPT_LIBRARY.map((p) => (
            <div key={p.title} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-900" style={{ background: "#FFF3C4" }}>{p.tag}</span>
                <button onClick={() => copy(p.title, p.prompt)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-800">
                  {copied === p.title ? <><Check className="h-3.5 w-3.5 text-green-600" /> 已复制</> : <><Copy className="h-3.5 w-3.5" /> 复制</>}
                </button>
              </div>
              <h3 className="mb-1.5 font-semibold text-gray-900">{p.title}</h3>
              <p className="flex-1 text-xs leading-5 text-gray-500">{p.prompt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { LayoutTemplate, Trophy, Megaphone, Star, Store, Paperclip, Loader2, Sparkles } from "lucide-react";
import { chat } from "@/lib/ai/client";
import { isConfigured, loadSettings } from "@/lib/ai/providers";
import AISettingsModal from "@/components/AISettingsModal";

const SCENARIOS = [
  { id: "conference", label: "行业会议", icon: Trophy, desc: "司南榜、行业峰会、专题沙龙、品类大会等" },
  { id: "campaign", label: "平台活动", icon: Megaphone, desc: "神券节、818、双12、新店流量扶持等" },
  { id: "benchmark", label: "标杆案例", icon: Star, desc: "成功故事、数据亮点、商家证言等" },
  { id: "store", label: "小店故事", icon: Store, desc: "BD探店日记、社区小店、烟火气记录" },
];

const ACCOUNTS = [
  { id: "bd", label: "BD账号", desc: "行业观察者视角，专业但有温度" },
  { id: "merchant", label: "商家账号", desc: "亲历者视角，第一人称真实感" },
];

const PLATFORMS = ["小红书", "视频号", "抖音", "大众点评"];
const STYLES = ["真实感强", "轻松幽默", "温暖治愈", "数据驱动", "故事化叙事", "简洁直接"];

export default function TemplatesPage() {
  const [scenario, setScenario] = useState<string | null>(null);
  const [bg, setBg] = useState("");
  const [extra, setExtra] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [platform, setPlatform] = useState("小红书");
  const [style, setStyle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [err, setErr] = useState("");

  const generate = async () => {
    if (!account || loading) return;
    if (!isConfigured(loadSettings())) { setSettingsOpen(true); return; }
    setLoading(true); setErr(""); setResult("");
    const sc = SCENARIOS.find((s) => s.id === scenario);
    const ac = ACCOUNTS.find((a) => a.id === account);
    try {
      const out = await chat(
        `你是一名资深新媒体内容策划。请基于以下配置，生成一份可直接发布的内容包（含标题、正文、3-5个话题标签）。
传播场景：${sc ? `${sc.label}（${sc.desc}）` : "通用内容"}
发布账号：${ac ? `${ac.label}（${ac.desc}）` : ""}
目标平台：${platform}${style ? `\n风格调性：${style}` : ""}
${bg ? `\n背景资料：\n${bg}` : ""}${extra ? `\n补充素材：\n${extra}` : ""}
请直接输出内容包，不要解释。`,
        { temperature: 0.7, maxTokens: 1800 }
      );
      setResult(out);
    } catch (e) { setErr((e as Error).message); } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      <AISettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFD100" }}>
          <LayoutTemplate className="h-5 w-5 text-gray-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">内容模板搭建</h1>
          <p className="mt-0.5 text-sm text-gray-500">选择场景配置，一键生成可发布的内容包</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        作品集演示：场景与文案为虚构示例。配置你自己的 API Key 后可真实生成内容包。
      </div>

      {/* 传播场景 */}
      <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 text-base font-bold text-gray-900">传播场景</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SCENARIOS.map((s) => (
            <button key={s.id} onClick={() => setScenario(s.id)}
              className={scenario === s.id ? "rounded-xl border-2 p-4 text-left" : "rounded-xl border border-gray-100 p-4 text-left hover:border-gray-300"}
              style={scenario === s.id ? { borderColor: "#FFD100", background: "#FFFBEB" } : {}}>
              <div className={scenario === s.id ? "mb-2 flex h-8 w-8 items-center justify-center rounded-lg" : "mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100"}
                style={scenario === s.id ? { background: "#FFD100" } : {}}>
                <s.icon className="h-4 w-4 text-gray-900" />
              </div>
              <div className="text-sm font-semibold text-gray-900">{s.label}</div>
              <div className="mt-1 text-xs leading-4 text-gray-400">{s.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 背景资料 */}
      <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-800">背景资料 <span className="font-normal text-gray-400">可选，填写后效果更好</span></label>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"><Paperclip className="h-3.5 w-3.5" /> 上传文件</button>
        </div>
        <textarea value={bg} onChange={(e) => setBg(e.target.value)}
          placeholder="直接粘贴背景信息：活动简介、品牌资料、数据报告、商家故事等"
          className="min-h-24 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-yellow-400 focus:bg-white" />
        <div className="mt-1 text-xs text-gray-300">{bg.length} 字</div>

        <div className="mb-2 mt-4 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-800">补充素材 <span className="font-normal text-gray-400">可选</span></label>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"><Paperclip className="h-3.5 w-3.5" /> 上传文件</button>
        </div>
        <textarea value={extra} onChange={(e) => setExtra(e.target.value)}
          placeholder="关键数据、金句、亮点描述等零散信息（AI会根据场景自动适配）"
          className="min-h-20 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-yellow-400 focus:bg-white" />
        <div className="mt-1 text-xs text-gray-300">{extra.length} 字</div>
      </section>

      {/* 发布账号 */}
      <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 text-base font-bold text-gray-900">发布账号 <span className="text-red-500">*</span></h2>
        <div className="grid grid-cols-2 gap-3">
          {ACCOUNTS.map((a) => (
            <button key={a.id} onClick={() => setAccount(a.id)}
              className={account === a.id ? "rounded-xl border-2 p-4 text-left" : "rounded-xl border border-gray-100 p-4 text-left hover:border-gray-300"}
              style={account === a.id ? { borderColor: "#FFD100", background: "#FFFBEB" } : {}}>
              <div className="text-sm font-semibold text-gray-900">{a.label}</div>
              <div className="mt-1 text-xs text-gray-400">{a.desc}</div>
            </button>
          ))}
        </div>

        <h2 className="mb-3 mt-6 text-base font-bold text-gray-900">目标平台</h2>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={platform === p ? "rounded-lg px-3.5 py-1.5 text-sm font-medium text-gray-900" : "rounded-lg bg-gray-50 px-3.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100"}
              style={platform === p ? { background: "#FFD100" } : {}}>
              {p}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">图文笔记，种草感强，情绪价值高</p>

        <h2 className="mb-3 mt-6 text-base font-bold text-gray-900">风格调性 <span className="font-normal text-sm text-gray-400">可选</span></h2>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button key={s} onClick={() => setStyle(style === s ? null : s)}
              className={style === s ? "rounded-lg px-3.5 py-1.5 text-sm font-medium text-gray-900" : "rounded-lg bg-gray-50 px-3.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100"}
              style={style === s ? { background: "#FFD100" } : {}}>
              {s}
            </button>
          ))}
        </div>
      </section>

      <button onClick={generate} disabled={!account || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold text-gray-900 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "#FFD100" }}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        {loading ? "生成中…" : "一键生成内容包"}
      </button>
      {!account && <p className="mt-2 text-center text-sm text-gray-400">请选择发布账号后生成</p>}
      {err && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{err}</p>}

      {result && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-3 text-base font-bold text-gray-900">生成结果</h2>
          <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{result}</div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  ShieldCheck, ChevronDown, ChevronUp, Upload, FileText, Video,
  Loader2, Sparkles, ExternalLink, Scale, Globe, MessageSquareWarning,
  BarChart3, TrendingUp, Target, Paperclip,
} from "lucide-react";
import { chat } from "@/lib/ai/client";
import { isConfigured, loadSettings } from "@/lib/ai/providers";
import AISettingsModal from "@/components/AISettingsModal";
import { DEMO_ACCOUNTS } from "@/lib/mockData";

const PLATFORMS = ["视频号", "抖音", "小红书", "大众点评"];

const SPECIAL_CHECKS = [
  { id: "medical", label: "医疗/健康/口腔/医美" },
  { id: "map", label: "中国地图画面" },
  { id: "food", label: "餐饮/酒店/丽人" },
  { id: "minor", label: "未成年人" },
  { id: "price", label: "价格促销" },
];

const DIMENSIONS = [
  { name: "法务", desc: "广告法、知识产权与隐私表达", icon: Scale },
  { name: "平台合规", desc: "标题、互动和商业表达边界", icon: Globe },
  { name: "公关舆情", desc: "敏感争议与误读风险", icon: MessageSquareWarning },
  { name: "事实数据", desc: "数据来源、结论可证实性", icon: BarChart3 },
  { name: "传播效果", desc: "钩子、信息密度与互动驱动", icon: TrendingUp },
  { name: "账号定位", desc: "是否符合账号受众与风格", icon: Target },
];

type DimReport = { name: string; level: string; text: string };

const DEMO_SCRIPT = "一家开在社区里的早餐店，把高峰期排队时间从20分钟缩短到8分钟。老板说，真正的变化不是更快出餐，而是让每一位赶时间的顾客都能从容吃上热早餐。";

const DEMO_REPORT: DimReport[] = [
  { name: "法务", level: "通过", text: "未发现绝对化用语、夸大功效或明显的侵权风险表达。" },
  { name: "平台合规", level: "通过", text: "标题与正文表达克制，未包含诱导互动、虚假承诺等高风险措辞。" },
  { name: "公关舆情", level: "注意", text: "涉及行业对比时，建议避免对其他经营者作贬损性评价。" },
  { name: "事实数据", level: "建议补充", text: "“缩短到8分钟”缺少可核查口径，建议补充统计时间范围与数据来源。" },
  { name: "传播效果", level: "可优化", text: "开头可增加具体人物、场景或反差数字，让前三秒更具停留理由。" },
  { name: "账号定位", level: "通过", text: "内容结构清晰，适合以“真实经营观察”为核心的账号调性。" },
];

export default function ReviewPage() {
  const [mode, setMode] = useState<"text" | "video">("text");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [account, setAccount] = useState(DEMO_ACCOUNTS[0].name);
  const [videoName, setVideoName] = useState("");
  const [script, setScript] = useState(DEMO_SCRIPT);
  const [special, setSpecial] = useState<string[]>([]);
  const [flowOpen, setFlowOpen] = useState(false);
  const [report, setReport] = useState<DimReport[]>(DEMO_REPORT);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [note, setNote] = useState("当前展示为预置演示审核结果。配置自己的 API Key 后，可对任意脚本发起实时审核。");

  const toggleSpecial = (id: string) =>
    setSpecial((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const audit = async () => {
    if (!script.trim()) return;
    if (!isConfigured(loadSettings())) { setSettingsOpen(true); return; }
    setLoading(true);
    setNote("正在从法务、平台合规、公关舆情、事实数据、传播效果与账号定位六个维度审核…");
    const specialText = special.length
      ? `\n请额外专项核查：${SPECIAL_CHECKS.filter((s) => special.includes(s.id)).map((s) => s.label).join("、")}。`
      : "";
    try {
      const raw = await chat(
        `请审核以下发布在${platform}（账号：${account}）的新媒体视频脚本。按“法务、平台合规、公关舆情、事实数据、传播效果、账号定位”六个维度，逐项输出风险级别（通过/注意/建议补充/可优化）和一句可执行建议。${specialText}脚本：\n${script}`,
        { temperature: 0.2, maxTokens: 1600 }
      );
      const lines = raw.split(/\n+/).filter(Boolean);
      setReport(DIMENSIONS.map(({ name }) => ({
        name,
        level: "已审核",
        text: lines.find((l) => l.includes(name))?.replace(/^[-\d.、\s]*/, "") || "模型已完成分析，请结合业务场景进一步确认。",
      })));
      setNote("已使用你在本机浏览器配置的模型完成审核；API Key 不会上传到本站服务器。");
    } catch (error) {
      setNote((error as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <AISettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFD100" }}>
            <ShieldCheck className="h-5 w-5 text-gray-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">视频审核</h1>
              <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white">video-reviewer V4</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">内容上线前的六维 AI 预审与优化建议</p>
          </div>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">AI 设置</button>
      </div>

      {/* 外部深度审核入口 */}
      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
        <div className="text-sm text-purple-900">
          <span className="font-semibold">垂直行业深度审核</span>
          <span className="ml-2 text-purple-600">涉及医疗、金融等强监管行业的内容，建议同步走专业审核通道</span>
        </div>
        <button className="flex shrink-0 items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700">
          前往审核 <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        作品集演示：账号与脚本均为虚构示例，审核结果为预置演示。配置你自己的 API Key 后可实时审核。
      </div>

      {/* 审核流程 */}
      <div className="mb-5 rounded-2xl border border-gray-100 bg-white">
        <button onClick={() => setFlowOpen(!flowOpen)} className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>审核流程说明</span>
          <span className="flex items-center gap-1 text-xs text-gray-400">{flowOpen ? "收起" : "查看流程"}{flowOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</span>
        </button>
        {flowOpen && (
          <div className="border-t border-gray-50 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              {["提交脚本/视频", "六维并行审核", "专项风险核查", "生成审核报告", "修改后复审"].map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1.5">{i + 1}. {step}</span>
                  {i < 4 && <span className="text-gray-300">→</span>}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-400">全维度审核通常在 1 分钟内完成；命中专项触发词的内容会自动加深对应维度检查。</p>
          </div>
        )}
      </div>

      {/* 审核方式 */}
      <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex gap-2">
          {([["text", "文字脚本", FileText], ["video", "上传视频", Video]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setMode(id)}
              className={mode === id ? "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium text-gray-900" : "flex items-center gap-1.5 rounded-lg bg-gray-50 px-3.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100"}
              style={mode === id ? { background: "#FFD100" } : {}}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* 基本信息 */}
        <h2 className="mb-3 text-base font-bold text-gray-900">基本信息</h2>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">发布平台</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-yellow-400 focus:bg-white">
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">发布账号</label>
            <select value={account} onChange={(e) => setAccount(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-yellow-400 focus:bg-white">
              {DEMO_ACCOUNTS.map((a) => <option key={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">视频名称（选填）</label>
            <input value={videoName} onChange={(e) => setVideoName(e.target.value)} placeholder="便于归档检索"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-yellow-400 focus:bg-white" />
          </div>
        </div>

        {/* 脚本 / 视频 */}
        {mode === "text" ? (
          <>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-800">视频脚本/文案</label>
              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"><Paperclip className="h-3.5 w-3.5" /> 上传文件</button>
            </div>
            <textarea value={script} onChange={(e) => setScript(e.target.value)}
              placeholder="粘贴视频口播脚本、标题与正文文案…"
              className="min-h-40 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm leading-6 outline-none focus:border-yellow-400 focus:bg-white" />
            <div className="mt-1 text-xs text-gray-300">{script.length} 字</div>
          </>
        ) : (
          <div className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400">
            <Upload className="h-6 w-6" />
            <p className="text-sm">拖拽或点击上传视频文件</p>
            <p className="text-xs">支持 MP4 / MOV，单个不超过 500MB（演示环境不实际上传）</p>
          </div>
        )}

        {/* 专项审核 */}
        <h2 className="mb-1 mt-5 text-base font-bold text-gray-900">专项审核 <span className="font-normal text-sm text-gray-400">命中场景自动加深核查</span></h2>
        <div className="mb-5 mt-3 flex flex-wrap gap-2">
          {SPECIAL_CHECKS.map((s) => (
            <button key={s.id} onClick={() => toggleSpecial(s.id)}
              className={special.includes(s.id) ? "rounded-lg px-3.5 py-1.5 text-sm font-medium text-gray-900" : "rounded-lg bg-gray-50 px-3.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100"}
              style={special.includes(s.id) ? { background: "#FFD100" } : {}}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-gray-500">{note}</p>
          <button onClick={audit} disabled={loading || (mode === "text" && !script.trim())}
            className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-900 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "#FFD100" }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "审核中…" : "开始六维审核"}
          </button>
        </div>
      </section>

      {/* 审核结论 */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">审核结论</h2>
            <p className="mt-0.5 text-xs text-gray-400">六个维度逐项给出风险级别与动作建议</p>
          </div>
          <button onClick={() => { setReport(DEMO_REPORT); setNote("已恢复预置演示结果。"); }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">恢复演示</button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {report.map((item) => {
            const dim = DIMENSIONS.find((d) => d.name === item.name);
            const Icon = dim?.icon ?? ShieldCheck;
            const pass = item.level === "通过";
            return (
              <div key={item.name} className="rounded-xl border border-gray-100 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <Icon className="h-4 w-4 text-gray-400" />{item.name}
                  </span>
                  <span className={pass ? "rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700" : "rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700"}>{item.level}</span>
                </div>
                <p className="text-xs leading-5 text-gray-500">{item.text}</p>
                {dim && <p className="mt-2 text-[10px] text-gray-300">{dim.desc}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

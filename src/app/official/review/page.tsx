"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Loader2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { chat } from "@/lib/ai/client";
import { isConfigured, loadSettings } from "@/lib/ai/providers";
import AISettingsModal from "@/components/AISettingsModal";

const dimensions = [
  ["事实与数据", "数据是否有来源、结论是否可证实", "低"],
  ["法律合规", "广告法、知识产权和隐私表达", "中"],
  ["平台规则", "标题、互动和商业表达边界", "低"],
  ["公关舆情", "敏感争议与误读风险", "中"],
  ["传播效果", "钩子、信息密度与互动驱动力", "低"],
  ["账号定位", "是否符合账号受众与表达风格", "低"],
] as const;

const demoReport = [
  { name: "事实与数据", level: "建议补充", text: "“增长显著”缺少可核查口径。建议补充时间范围、对比基准与数据来源。" },
  { name: "法律合规", level: "通过", text: "未发现绝对化用语、夸大功效或明显的侵权风险表达。" },
  { name: "平台规则", level: "通过", text: "标题与正文表达克制，未包含诱导互动、虚假承诺等高风险措辞。" },
  { name: "公关舆情", level: "注意", text: "涉及行业对比时，建议避免对其他经营者作贬损性评价。" },
  { name: "传播效果", level: "可优化", text: "开头可增加具体人物、场景或反差数字，让前三秒更具停留理由。" },
  { name: "账号定位", level: "通过", text: "内容结构清晰，适合以“真实经营观察”为核心的账号调性。" },
];

export default function ReviewPage() {
  const [content, setContent] = useState("一家开在社区里的早餐店，把高峰期排队时间从20分钟缩短到8分钟。老板说，真正的变化不是更快出餐，而是让每一位赶时间的顾客都能从容吃上热早餐。");
  const [report, setReport] = useState(demoReport);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [note, setNote] = useState("当前展示为预置演示审核结果。配置自己的 API Key 后，可对任意内容发起实时审核。");

  const audit = async () => {
    if (!content.trim()) return;
    if (!isConfigured(loadSettings())) { setSettingsOpen(true); return; }
    setLoading(true);
    setNote("正在从事实、合规、平台、舆情、传播与账号定位六个维度审核…");
    try {
      const raw = await chat(`请审核以下新媒体内容。按“事实与数据、法律合规、平台规则、公关舆情、传播效果、账号定位”六个维度，逐项输出风险级别（通过/注意/建议补充/可优化）和一句可执行建议。内容：\n${content}`, { temperature: 0.2, maxTokens: 1600 });
      const lines = raw.split(/\n+/).filter(Boolean);
      setReport(dimensions.map(([name]) => ({ name, level: "已审核", text: lines.find((line) => line.includes(name))?.replace(/^[-\d.、\s]*/, "") || "模型已完成分析，请结合业务场景进一步确认。" })));
      setNote("已使用你在本机浏览器配置的模型完成审核；API Key 不会上传到本站服务器。");
    } catch (error) {
      setNote((error as Error).message);
    } finally { setLoading(false); }
  };

  return <div className="mx-auto max-w-7xl p-6 lg:p-8">
    <AISettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-300"><ShieldCheck className="h-5 w-5" /></div><div><h1 className="text-xl font-bold text-gray-900">六维审核</h1><p className="mt-1 text-sm text-gray-500">内容上线前的 AI 辅助预审与优化建议</p></div></div>
      <button onClick={() => setSettingsOpen(true)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">AI 设置</button>
    </div>
    <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">作品集演示：预置案例和审核结果均为虚构内容。实时审核仅在你配置自己的 API Key 后启用。</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-gray-900">待审核内容</h2><span className="text-xs text-gray-400">支持脚本、标题、口播文案</span></div><textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-72 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-7 outline-none focus:border-yellow-400 focus:bg-white" /><div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs leading-5 text-gray-500">{note}</p><button disabled={loading} onClick={audit} className="flex shrink-0 items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? "审核中" : "开始审核"}</button></div></section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-gray-900">审核结论</h2><p className="mt-1 text-xs text-gray-500">六项维度，逐条给出动作建议</p></div><button onClick={() => { setReport(demoReport); setNote("已恢复预置演示结果。"); }} title="恢复演示" className="rounded-md p-2 text-gray-400 hover:bg-gray-100"><RefreshCw className="h-4 w-4" /></button></div><div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 className="h-4 w-4" />建议修改后进入发布流程</div><div className="space-y-3">{report.map((item) => <div key={item.name} className="rounded-xl border border-gray-100 p-3.5"><div className="mb-1.5 flex items-center justify-between"><span className="font-medium text-gray-800">{item.name}</span><span className={item.level === "通过" ? "rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700" : "rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700"}>{item.level}</span></div><p className="text-xs leading-5 text-gray-500">{item.text}</p></div>)}</div></section>
    </div>
    <div className="mt-6 grid gap-3 md:grid-cols-3">{dimensions.map(([name, desc, risk]) => <div key={name} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4"><ClipboardCheck className="mt-0.5 h-4 w-4 text-gray-400" /><div><p className="text-sm font-medium text-gray-800">{name}</p><p className="mt-1 text-xs text-gray-500">{desc}</p></div>{risk === "中" && <AlertTriangle className="ml-auto h-4 w-4 text-amber-500" />}</div>)}</div>
  </div>;
}

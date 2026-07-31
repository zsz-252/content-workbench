"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Bookmark, Library, Search, Sparkles, Tag } from "lucide-react";

const cases = [
  { title: "一条“凌晨四点”的短片，为什么让评论区集体共情", type: "情绪叙事", tag: "内容拆解", heat: "82.6万", desc: "用一个具体时间锚点打开真实人物故事，再把行业价值隐藏在行动细节里。", color: "bg-orange-100" },
  { title: "社区早餐店的八分钟：把效率故事拍得有温度", type: "商家案例", tag: "人物纪实", heat: "64.2万", desc: "从用户等待感受切入，而不是直接描述经营成绩，建立可感知的价值主张。", color: "bg-yellow-100" },
  { title: "小城周末游的爆款公式：距离感与新鲜感如何平衡", type: "趋势洞察", tag: "选题方法", heat: "51.8万", desc: "用低决策成本降低观看门槛，并在内容中连续提供可复制的行动信息。", color: "bg-emerald-100" },
  { title: "把复杂服务讲明白：三段式口播的留存设计", type: "表达方法", tag: "脚本结构", heat: "39.5万", desc: "反差钩子、真实场景、一个具体方法，形成紧凑而可信的表达闭环。", color: "bg-blue-100" },
  { title: "从评论区反推选题：高互动内容的共同语言", type: "运营策略", tag: "用户洞察", heat: "32.1万", desc: "从评论里的提问、争议和经验分享中，提炼下一轮内容的共鸣关键词。", color: "bg-violet-100" },
  { title: "不靠大场面，如何用一张菜单拍出人物关系", type: "创意表达", tag: "镜头语言", heat: "28.4万", desc: "以具象物件承载人物关系，让画面信息代替解释性旁白。", color: "bg-rose-100" },
];

export default function CasesPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("全部");
  const [saved, setSaved] = useState<string[]>([]);
  const types = ["全部", ...Array.from(new Set(cases.map((item) => item.type)))];
  const filtered = useMemo(() => cases.filter((item) => (active === "全部" || item.type === active) && `${item.title}${item.desc}${item.tag}`.includes(query.trim())), [active, query]);
  const toggleSave = (title: string) => setSaved((prev) => prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]);
  return <div className="mx-auto max-w-7xl p-6 lg:p-8">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-300"><Library className="h-5 w-5" /></div><div><h1 className="text-xl font-bold text-gray-900">案例库</h1><p className="mt-1 text-sm text-gray-500">沉淀可复用的内容洞察、结构与表达方法</p></div></div><button className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"><Sparkles className="h-4 w-4" />生成选题灵感</button></div>
    <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">作品集演示：所有案例标题、传播数据和拆解结论均为虚构示例，用于展示内容运营产品交互。</div>
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex flex-wrap gap-2">{types.map((type) => <button onClick={() => setActive(type)} key={type} className={active === type ? "rounded-full bg-gray-900 px-3 py-1.5 text-sm text-white" : "rounded-full bg-white px-3 py-1.5 text-sm text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}>{type}</button>)}</div><label className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-gray-200 md:w-72"><Search className="h-4 w-4 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="搜索案例或关键词" /></label></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((item) => <article key={item.title} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className={`mb-5 flex h-28 items-end rounded-xl p-4 ${item.color}`}><span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-gray-700">{item.type}</span></div><div className="mb-3 flex items-center justify-between text-xs text-gray-400"><span className="flex items-center gap-1"><Tag className="h-3 w-3" />{item.tag}</span><span>模拟热度 {item.heat}</span></div><h2 className="min-h-12 text-base font-semibold leading-6 text-gray-900">{item.title}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">{item.desc}</p><div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3"><button onClick={() => toggleSave(item.title)} className={saved.includes(item.title) ? "flex items-center gap-1.5 text-sm text-amber-700" : "flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"}><Bookmark className={`h-4 w-4 ${saved.includes(item.title) ? "fill-current" : ""}`} />{saved.includes(item.title) ? "已收藏" : "收藏"}</button><button className="flex items-center gap-1 text-sm font-medium text-gray-900">查看拆解 <ArrowUpRight className="h-4 w-4" /></button></div></article>)}</div>
    {!filtered.length && <div className="rounded-xl bg-white py-20 text-center text-sm text-gray-400">没有匹配的案例，换个关键词试试。</div>}
  </div>;
}

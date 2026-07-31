"use client";

import type { LucideIcon } from "lucide-react";
import { BarChart3, CheckCircle2, Clock3, Network, Plus, Users } from "lucide-react";

const stats: [string, string, LucideIcon][] = [
  ["协作创作者", "28", Users],
  ["本周选题", "42", BarChart3],
  ["待审核内容", "16", Clock3],
  ["已完成发布", "35", CheckCircle2],
];

const creators = [
  ["林野食记", "城市美食", "脚本确认", "78%", "#FFD100"],
  ["阿汤的周末", "城市出行", "素材待补", "52%", "#2EC4B6"],
  ["慢生活研究所", "本地生活", "已发布", "91%", "#7B61FF"],
  ["巷口故事", "人物纪实", "审核中", "66%", "#FF6B35"],
  ["一日一店", "零售观察", "选题策划", "34%", "#00A6ED"],
];

export default function MatrixHubPage() {
  return <div className="mx-auto max-w-7xl p-6 lg:p-8"><div className="mb-6 flex items-start justify-between"><div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-300"><Network className="h-5 w-5" /></div><div><h1 className="text-xl font-bold">矩阵运营中心</h1><p className="mt-1 text-sm text-gray-500">创作者协作、选题流转和内容进度一览</p></div></div><button className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"><Plus className="h-4 w-4" />新增协作方</button></div><div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">作品集演示：创作者档案、进度与指标均为虚构示例。</div><div className="grid gap-4 md:grid-cols-4">{stats.map(([label, value, Icon]) => { return <div key={label} className="rounded-xl border border-gray-200 bg-white p-4"><Icon className="mb-4 h-5 w-5 text-gray-400" /><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-sm text-gray-500">{label}</p></div>; })}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"><section className="rounded-2xl border border-gray-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">协作进度</h2><button className="text-sm text-gray-500">查看全部</button></div><div className="space-y-4">{creators.map(([name, area, status, rate, color]) => <div key={name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold" style={{ background: color }}>{name.slice(0, 1)}</div><div><div className="flex justify-between text-sm"><span className="font-medium">{name}</span><span className="text-gray-400">{area}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full" style={{ width: rate, background: color }} /></div></div><span className="rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-600">{status}</span></div>)}</div></section><section className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-semibold">本周节奏</h2><div className="mt-5 space-y-4">{[["周一", "选题共创会", "8 个新方向进入脚本阶段"], ["周三", "内容审核", "6 条内容等待反馈"], ["周五", "复盘同步", "回收数据与案例沉淀"]].map(([day, title, text]) => <div key={day} className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold">{day}</span><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-gray-500">{text}</p></div></div>)}</div></section></div></div>;
}

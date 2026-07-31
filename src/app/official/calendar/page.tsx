"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const items = [
  ["06", "选题共创", "早餐店人物短片", "城市美食观察", "bg-yellow-100"],
  ["09", "脚本确认", "周末小城路线", "周末去哪儿", "bg-teal-100"],
  ["13", "内容审核", "社区零售观察", "本地生活笔记", "bg-orange-100"],
  ["18", "发布排期", "健康生活的一天", "健康生活指南", "bg-violet-100"],
  ["22", "数据复盘", "即时零售效率故事", "即时零售观察", "bg-rose-100"],
];

export default function CalendarPage() {
  return <div className="mx-auto max-w-7xl p-6 lg:p-8"><div className="mb-6 flex items-start justify-between"><div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-300"><CalendarDays className="h-5 w-5" /></div><div><h1 className="text-xl font-bold">营销日历</h1><p className="mt-1 text-sm text-gray-500">营销节点、内容排期和协作进度统一管理</p></div></div><button className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"><Plus className="h-4 w-4" />新建排期</button></div><div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">作品集演示：排期内容与账号信息均为虚构示例。</div><section className="rounded-2xl border border-gray-200 bg-white p-5"><div className="mb-6 flex items-center justify-between"><button className="rounded-md p-2 hover:bg-gray-100"><ChevronLeft className="h-4 w-4" /></button><div className="text-center"><p className="font-semibold">2026 年 8 月</p><p className="mt-1 text-xs text-gray-400">内容排期示例</p></div><button className="rounded-md p-2 hover:bg-gray-100"><ChevronRight className="h-4 w-4" /></button></div><div className="grid grid-cols-7 border-l border-t border-gray-100">{["一","二","三","四","五","六","日"].map((d) => <div key={d} className="border-b border-r border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400">周{d}</div>)}{Array.from({ length: 35 }, (_, i) => { const day = i - 4; const item = items.find(([date]) => Number(date) === day); return <div key={i} className="min-h-28 border-b border-r border-gray-100 p-2"><span className={day > 0 && day <= 31 ? "text-xs text-gray-600" : "text-xs text-gray-300"}>{day > 0 && day <= 31 ? day : ""}</span>{item && <div className={`mt-2 rounded-lg p-2 ${item[4]}`}><p className="text-xs font-medium">{item[1]}</p><p className="mt-1 text-xs leading-4 text-gray-700">{item[2]}</p><p className="mt-1 text-[10px] text-gray-500">{item[3]}</p></div>}</div>; })}</div></section></div>;
}

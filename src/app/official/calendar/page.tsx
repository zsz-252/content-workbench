"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type Ev = { label: string; kind: "holiday" | "solar" | "marketing" | "caution" };

const KIND_STYLE: Record<Ev["kind"], { dot: string; text: string; label: string }> = {
  holiday: { dot: "bg-red-400", text: "text-red-600", label: "节假日" },
  solar: { dot: "bg-emerald-400", text: "text-emerald-600", label: "节气" },
  marketing: { dot: "bg-amber-400", text: "text-amber-600", label: "营销节点" },
  caution: { dot: "bg-gray-400", text: "text-gray-500", label: "谨慎发布" },
};

// 以 2026 年 9 月为示例月份（数据为虚构/常识性公共节点）
const EVENTS: Record<number, Ev> = {
  3: { label: "抗战胜利纪念日（谨慎）", kind: "caution" },
  7: { label: "白露", kind: "solar" },
  10: { label: "教师节", kind: "marketing" },
  18: { label: "九一八事变纪念日（谨慎）", kind: "caution" },
  23: { label: "秋分", kind: "solar" },
  25: { label: "中秋节", kind: "holiday" },
};

const MONTHS = [
  { year: 2026, month: 9, label: "九月" },
];

export default function CalendarPage() {
  const [idx] = useState(0);
  const { year, month, label } = MONTHS[idx];

  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=周日
  const daysInMonth = new Date(year, month, 0).getDate();
  // 让周一在第一列
  const offset = (firstDow + 6) % 7;
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (d: number | null) =>
    d !== null && today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d;

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFD100" }}>
          <CalendarDays className="h-5 w-5 text-gray-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">营销日历</h1>
          <p className="mt-0.5 text-sm text-gray-500">全局营销节点一览</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        作品集演示：节点为公开常识性日期与虚构营销节点的组合示例。
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        {/* 月份切换 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"><ChevronLeft className="h-4 w-4" /></button>
            <div className="text-base font-semibold text-gray-900">{year}年 {label}</div>
            <button className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"><ChevronRight className="h-4 w-4" /></button>
            <button className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white">本月</button>
          </div>
        </div>

        {/* 图例 */}
        <div className="mb-4 flex flex-wrap gap-4">
          {(Object.keys(KIND_STYLE) as Ev["kind"][]).map((k) => (
            <span key={k} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`h-2 w-2 rounded-full ${KIND_STYLE[k].dot}`} />{KIND_STYLE[k].label}
            </span>
          ))}
        </div>

        {/* 星期表头 */}
        <div className="grid grid-cols-7 border-l border-t border-gray-100">
          {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
            <div key={d} className="border-b border-r border-gray-100 bg-gray-50 px-2 py-2 text-center text-xs font-medium text-gray-400">周{d}</div>
          ))}
          {cells.map((d, i) => {
            const ev = d ? EVENTS[d] : undefined;
            const style = ev ? KIND_STYLE[ev.kind] : undefined;
            return (
              <div key={i} className={`min-h-24 border-b border-r border-gray-100 p-2 ${isToday(d) ? "bg-yellow-50" : ""}`}>
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${isToday(d) ? "bg-gray-900 font-semibold text-white" : "text-gray-600"}`}>
                  {d ?? ""}
                </span>
                {ev && (
                  <div className={`mt-1.5 flex items-start gap-1 text-[11px] leading-4 ${style!.text}`}>
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${style!.dot}`} />
                    <span>{ev.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

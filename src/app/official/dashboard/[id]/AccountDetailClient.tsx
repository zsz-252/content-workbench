"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEMO_ACCOUNTS, DEMO_AUDIENCE, getTrends, getVideos, getAccountStats, fmt,
} from "@/lib/mockData";
import {
  ArrowLeft, Eye, ThumbsUp, MessageSquare, Share2, Users,
  TrendingUp, Flame, ArrowUpDown,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type SortKey = "views" | "likes" | "comments" | "shares" | "followCount" | "pubDate";

export default function AccountDetailClient({ accountId }: { accountId: string }) {
  const acc = DEMO_ACCOUNTS.find((a) => a.id === accountId) ?? DEMO_ACCOUNTS[0];

  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const stats = useMemo(() => getAccountStats(acc.id), [acc.id]);
  const trend = useMemo(() => getTrends(acc.id, 30), [acc.id]);
  const allVideos = useMemo(() => getVideos(acc.id, 24), [acc.id]);

  const sorted = useMemo(() => {
    const arr = [...allVideos];
    arr.sort((a, b) => {
      const x = a[sortKey], y = b[sortKey];
      const cmp = typeof x === "string" ? String(x).localeCompare(String(y)) : Number(x) - Number(y);
      return sortAsc ? cmp : -cmp;
    });
    return arr;
  }, [allVideos, sortKey, sortAsc]);

  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(sorted.length / pageSize);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortAsc((v) => !v);
    else { setSortKey(k); setSortAsc(false); }
    setPage(1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* 页头 */}
      <div className="flex items-center gap-3">
        <Link href="/"
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
             style={{ background: acc.color }}>
          <span className="text-xs font-bold" style={{ color: acc.textColor }}>{acc.short}</span>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{acc.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">账号数据详情 · 演示数据</p>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "粉丝总数", value: fmt(acc.followers), color: "#FFD100" },
          { icon: Eye, label: "累计播放", value: fmt(stats.totalViews), color: "#FF6B35" },
          { icon: Flame, label: "百万爆款", value: `${stats.hits} 条`, color: "#F45B69" },
          { icon: TrendingUp, label: "作品总数", value: `${stats.videoCount} 条`, color: "#2EC4B6" },
        ].map((m) => (
          <Card key={m.label} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                     style={{ background: m.color + "22" }}>
                  <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                </div>
                <span className="text-xs text-gray-500">{m.label}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 画像分布 */}
      <Card className="border-gray-200">
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">受众画像</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "性别", data: DEMO_AUDIENCE.gender },
              { title: "年龄", data: DEMO_AUDIENCE.age },
              { title: "城市层级", data: DEMO_AUDIENCE.city },
            ].map((g) => (
              <div key={g.title}>
                <div className="text-[11px] text-gray-400 mb-2">{g.title}</div>
                <div className="space-y-1.5">
                  {g.data.map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 w-16 shrink-0">{d.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full"
                             style={{ width: `${d.value}%`, background: acc.color }} />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-600 w-8 text-right">
                        {d.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 趋势 */}
      <Card className="border-gray-200">
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">近 30 天播放趋势</h2>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }}
                       axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false}
                       tickLine={false} tickFormatter={(v) => fmt(v)} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                         formatter={(v) => fmt(Number(v))} />
                <Line type="monotone" dataKey="views" stroke={acc.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 视频列表 */}
      <Card className="border-gray-200">
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">作品列表</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-[11px] font-medium text-gray-400 w-8">#</th>
                  <th className="text-left py-2 px-2 text-[11px] font-medium text-gray-400">标题</th>
                  {([
                    ["pubDate", "发布"], ["views", "播放"], ["likes", "点赞"],
                    ["comments", "评论"], ["shares", "分享"], ["followCount", "涨粉"],
                  ] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k} className="text-right py-2 px-2">
                      <button onClick={() => toggleSort(k)}
                              className={`inline-flex items-center gap-1 text-[11px] font-medium transition ${
                                sortKey === k ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                              }`}>
                        {label}
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((v, i) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                    <td className="py-2.5 px-2 text-[11px] text-gray-400">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 text-[13px]">{v.title}</span>
                        {v.views >= 1_000_000 && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                style={{ background: "#FEF3C7", color: "#B45309" }}>
                            爆款
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-[11px] text-gray-400">{v.pubDate.slice(5)}</td>
                    <td className="py-2.5 px-2 text-right text-[13px] font-semibold text-gray-900">{fmt(v.views)}</td>
                    <td className="py-2.5 px-2 text-right text-[13px] text-gray-600">{fmt(v.likes)}</td>
                    <td className="py-2.5 px-2 text-right text-[13px] text-gray-600">{fmt(v.comments)}</td>
                    <td className="py-2.5 px-2 text-right text-[13px] text-gray-600">{fmt(v.shares)}</td>
                    <td className="py-2.5 px-2 text-right text-[13px] text-gray-600">{fmt(v.followCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-[11px] text-gray-400">
              共 {sorted.length} 条 · 第 {page}/{totalPages} 页
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                上一页
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                下一页
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEMO_ACCOUNTS, getTrends, getVideos, getAccountStats, fmt,
} from "@/lib/mockData";
import {
  BarChart2, Eye, ThumbsUp, Share2, MessageSquare,
  TrendingUp, Users, Flame, ExternalLink,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const RANGES = [
  { label: "近 7 天", days: 7 },
  { label: "近 30 天", days: 30 },
];

export default function DataDashboard() {
  const [rangeIdx, setRangeIdx] = useState(1);
  const [activeAccount, setActiveAccount] = useState<string>(DEMO_ACCOUNTS[0].id);

  const days = RANGES[rangeIdx].days;

  // 汇总卡片
  const summary = useMemo(() => {
    let views = 0, likes = 0, comments = 0, shares = 0, follows = 0;
    for (const acc of DEMO_ACCOUNTS) {
      for (const t of getTrends(acc.id, days)) {
        views += t.views; likes += t.likes; comments += t.comments;
        shares += t.shares; follows += t.follows;
      }
    }
    return { views, likes, comments, shares, follows };
  }, [days]);

  const trend = useMemo(() => getTrends(activeAccount, days), [activeAccount, days]);
  const topVideos = useMemo(
    () => getVideos(activeAccount, 20).sort((a, b) => b.views - a.views).slice(0, 6),
    [activeAccount]
  );
  const activeAcc = DEMO_ACCOUNTS.find((a) => a.id === activeAccount)!;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* 页头 */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFD100" }}>
          <BarChart2 className="w-[18px] h-[18px] text-gray-900" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">数据看板</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            矩阵账号传播数据总览 · 演示数据
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIdx(i)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                rangeIdx === i ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 演示数据说明 */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5 text-xs text-blue-800">
        本站为个人作品集演示版本，所有账号名称与数据指标均为虚构示例，不代表任何真实业务。
      </div>

      {/* 汇总指标 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Eye, label: "播放量", value: summary.views, color: "#FFD100" },
          { icon: ThumbsUp, label: "点赞", value: summary.likes, color: "#FF6B35" },
          { icon: MessageSquare, label: "评论", value: summary.comments, color: "#2EC4B6" },
          { icon: Share2, label: "分享", value: summary.shares, color: "#7B61FF" },
          { icon: Users, label: "涨粉", value: summary.follows, color: "#00A6ED" },
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
              <div className="text-xl font-bold text-gray-900">{fmt(m.value)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 账号卡片 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">账号概览</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_ACCOUNTS.map((acc) => {
            const st = getAccountStats(acc.id);
            return (
              <Card key={acc.id} className="border-gray-200 overflow-hidden">
                <div style={{ height: 3, background: acc.color }} />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: acc.color }} />
                    <span className="text-sm font-semibold text-gray-900 flex-1">{acc.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[11px] text-gray-400">粉丝</div>
                      <div className="text-sm font-bold text-gray-900">{fmt(acc.followers)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400">总播放</div>
                      <div className="text-sm font-bold text-gray-900">{fmt(st.totalViews)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400">爆款</div>
                      <div className="text-sm font-bold text-gray-900">{st.hits} 条</div>
                    </div>
                  </div>

                  {/* 目标进度 */}
                  <div className="space-y-1.5">
                    {[
                      { label: "声量", pct: st.voiceProgress },
                      { label: "粉丝", pct: st.followerProgress },
                      { label: "爆款", pct: st.hitProgress },
                    ].map((p) => (
                      <div key={p.label} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400 w-7 shrink-0">{p.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                               style={{ width: `${p.pct}%`, background: acc.color }} />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-600 w-8 text-right">{p.pct}%</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/official/dashboard/${acc.id}`}
                    className="flex items-center justify-center gap-1.5 w-full h-8 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition"
                  >
                    查看详情 <ExternalLink className="w-3 h-3" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 趋势图 */}
      <Card className="border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">播放趋势</h2>
            </div>
            <div className="flex flex-wrap gap-1">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveAccount(a.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    activeAccount === a.id
                      ? "text-gray-900"
                      : "text-gray-400 hover:text-gray-600 bg-gray-50"
                  }`}
                  style={activeAccount === a.id ? { background: a.color + "33" } : {}}
                >
                  {a.short}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }}
                       axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => fmt(v)} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(v) => fmt(Number(v))}
                />
                <Line type="monotone" dataKey="views" stroke={activeAcc.color}
                      strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 热门内容 */}
      <Card className="border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-gray-700">
              热门内容 · {activeAcc.name}
            </h2>
          </div>
          <div className="space-y-2">
            {topVideos.map((v, i) => (
              <div key={v.id}
                   className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  i < 3 ? "text-gray-900" : "bg-gray-100 text-gray-400"
                }`} style={i < 3 ? { background: "#FFD100" } : {}}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{v.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{v.pubDate}</p>
                </div>
                <div className="flex gap-4 text-right shrink-0">
                  <div>
                    <div className="text-[10px] text-gray-400">播放</div>
                    <div className="text-xs font-semibold text-gray-900">{fmt(v.views)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">点赞</div>
                    <div className="text-xs font-semibold text-gray-900">{fmt(v.likes)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">涨粉</div>
                    <div className="text-xs font-semibold text-gray-900">{fmt(v.followCount)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

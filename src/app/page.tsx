"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BarChart2, ChevronDown, ExternalLink } from "lucide-react";
import { DEMO_ACCOUNTS, getTrends, getVideos, getAccountStats, fmt } from "@/lib/mockData";

const RANGES = ["近7天", "近30天", "近90天", "近180天", "自定义"];
const FILTERS = ["全部账号", "本地", "餐饮", "旅行", "医药", "闪购", "服务零售"];

export default function DataDashboard() {
  const [range, setRange] = useState("近30天");
  const [filter, setFilter] = useState("全部账号");

  const accounts = DEMO_ACCOUNTS;
  const stats = useMemo(() => accounts.map((a) => ({ acc: a, st: getAccountStats(a.id) })), [accounts]);

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      {/* 页头 */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFD100" }}>
          <BarChart2 className="h-5 w-5 text-gray-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">数据看板</h1>
          <p className="mt-0.5 text-sm text-gray-500">全年目标进展 · 分时段数据统计</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        本站为个人作品集演示版本，所有账号名称与数据指标均为虚构示例，不代表任何真实业务。
      </div>

      {/* 全年目标进展 */}
      <section className="mb-8">
        <div className="mb-4 flex items-start gap-3">
          <h2 className="text-lg font-bold leading-tight text-gray-900">全年目标<br />进展</h2>
          <p className="pt-0.5 text-xs leading-5 text-gray-400">
            粉丝数→channel_accounts · 播放量→channel_videos累计 ·<br />爆款→videos中views≥阈值
          </p>
        </div>
        <div className="space-y-4">
          {stats.map(({ acc, st }) => (
            <div key={acc.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div style={{ height: 4, background: acc.color }} />
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: acc.color }} />
                  <span className="text-sm font-semibold text-gray-900">{acc.name}</span>
                </div>
                {/* 声量 */}
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm text-gray-500">全年传播声量</span>
                  <span className="text-sm font-bold text-gray-900">{fmt(st.totalViews)} <span className="font-normal text-gray-400">/ 目标{fmt(acc.targetVoice)}</span></span>
                </div>
                <div className="mb-1 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full" style={{ width: `${st.voiceProgress}%`, background: acc.color }} />
                </div>
                <div className="mb-4 text-right text-sm font-semibold" style={{ color: acc.color }}>{st.voiceProgress}%</div>
                {/* 粉丝 + 爆款 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-sm text-gray-500">粉丝</span>
                      <span className="text-sm font-semibold" style={{ color: acc.color }}>{st.followerProgress}%</span>
                    </div>
                    <div className="mb-1 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${st.followerProgress}%`, background: acc.color }} />
                    </div>
                    <div className="text-xs text-gray-400">{fmt(acc.followers)} / {fmt(acc.targetFollowers)}</div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-sm text-gray-500">100万+爆款</span>
                      <span className="text-sm font-semibold" style={{ color: acc.color }}>{st.hitProgress}%</span>
                    </div>
                    <div className="mb-1 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${st.hitProgress}%`, background: acc.color }} />
                    </div>
                    <div className="text-xs text-gray-400">{st.hits}条 / 目标{acc.targetHits}条</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 分时段数据统计 */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <h2 className="text-lg font-bold leading-tight text-gray-900">分时段数据<br />统计</h2>
            <p className="pt-0.5 text-xs leading-5 text-gray-400">播放/点赞/分享→channel_videos · 新增粉丝→channel_trends ·<br />发布数→channel_videos</p>
          </div>
          <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            视频号助手后台 <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 时间范围 */}
        <div className="mb-3 flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={range === r ? "rounded-lg bg-gray-900 px-3.5 py-1.5 text-sm text-white" : "rounded-lg bg-white px-3.5 py-1.5 text-sm text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}>
              {r}
            </button>
          ))}
        </div>
        {/* 账号筛选 */}
        <div className="mb-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={filter === f ? "rounded-lg px-3.5 py-1.5 text-sm text-gray-900" : "rounded-lg bg-white px-3.5 py-1.5 text-sm text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}
              style={filter === f ? { background: "#FFD100" } : {}}>
              {f}
            </button>
          ))}
        </div>

        {/* 账号汇总卡 */}
        <div className="space-y-4">
          {stats.map(({ acc, st }) => {
            const videos = getVideos(acc.id, 30);
            const published = videos.length;
            const views = videos.reduce((s, v) => s + v.views, 0);
            const likes = videos.reduce((s, v) => s + v.likes, 0);
            const shares = videos.reduce((s, v) => s + v.shares, 0);
            return (
              <div key={acc.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: acc.color }} />
                    <span className="font-semibold text-gray-900">{acc.name}</span>
                    <span className="text-sm text-gray-400">发布 {published} 条</span>
                  </div>
                  <span className="text-sm text-gray-400">{range} 汇总</span>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="flex gap-8">
                    <div><div className="text-xs text-gray-400">播放</div><div className="text-lg font-bold text-gray-900">{fmt(views)}</div></div>
                    <div><div className="text-xs text-gray-400">点赞</div><div className="text-lg font-bold text-gray-900">{fmt(likes)}</div></div>
                    <div><div className="text-xs text-gray-400">分享</div><div className="text-lg font-bold text-gray-900">{fmt(shares)}</div></div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/official/dashboard/${acc.id}`} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">查看视频详情</Link>
                    <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">后台</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

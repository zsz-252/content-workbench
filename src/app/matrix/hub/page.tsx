"use client";

import { useState } from "react";
import { Network, ExternalLink, Users, Layers, Trophy, TrendingUp, LayoutGrid, UsersRound, ClipboardList, Copy } from "lucide-react";

type Creator = {
  name: string;
  mis: string;
  works: number;
  activities: number;
  platforms: number;
  phone: string;
  platformTag: string | null;
  lastSubmit: string;
};

const CREATORS: Creator[] = [
  { name: "林晓雨", mis: "linxiaoyu", works: 12, activities: 2, platforms: 2, phone: "138****6521", platformTag: "抖音", lastSubmit: "09-12" },
  { name: "陈立群", mis: "chenliqun", works: 8, activities: 1, platforms: 1, phone: "139****8830", platformTag: "视频号", lastSubmit: "09-08" },
  { name: "赵梦琪", mis: "zhaomengqi", works: 0, activities: 0, platforms: 0, phone: "185****4216", platformTag: null, lastSubmit: "—" },
  { name: "孙浩然", mis: "sunhaoran", works: 15, activities: 3, platforms: 2, phone: "186****9042", platformTag: "小红书", lastSubmit: "09-14" },
  { name: "周雅婷", mis: "zhouyating", works: 5, activities: 1, platforms: 1, phone: "137****3358", platformTag: "抖音", lastSubmit: "08-29" },
  { name: "吴文博", mis: "wuwenbo", works: 0, activities: 0, platforms: 0, phone: "152****6617", platformTag: null, lastSubmit: "—" },
];

const TABS = [
  { id: "cards", label: "卡片总览", icon: LayoutGrid },
  { id: "members", label: "成员管理", icon: UsersRound },
  { id: "survey", label: "问卷回收", icon: ClipboardList },
] as const;

export default function MatrixHubPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("cards");
  const totalCreators = CREATORS.length;
  const totalWorks = CREATORS.reduce((s, c) => s + c.works, 0);
  const totalPlatforms = new Set(CREATORS.flatMap((c) => (c.platformTag ? [c.platformTag] : []))).size;
  const todayNew = 0;

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      {/* 页头 */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFD100" }}>
            <Network className="h-5 w-5 text-gray-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">矩阵运营中心</h1>
            <p className="mt-0.5 text-sm text-gray-500">达人矩阵全局数据汇总与管理</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <ExternalLink className="h-4 w-4" /> BD信息登记
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        作品集演示：达人姓名、账号、作品数与联系方式均为虚构示例。
      </div>

      {/* 达人总览条 */}
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600">
        <Users className="h-4 w-4 text-gray-400" />
        <span className="font-medium text-gray-900">达人总览</span>
        <span className="text-gray-300">—</span>
        <span className="text-gray-400">达人矩阵全局数据汇总</span>
      </div>

      {/* 统计卡 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Users, label: "总达人数", value: totalCreators, color: "#7B61FF" },
          { icon: Layers, label: "总作品数", value: totalWorks, color: "#FF6B35" },
          { icon: Trophy, label: "覆盖平台数", value: totalPlatforms, color: "#FFC400" },
          { icon: TrendingUp, label: "今日新增作品", value: todayNew, color: "#00B365" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: s.color + "1f" }}>
              <s.icon style={{ color: s.color, width: 18, height: 18 }} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="mt-0.5 text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div className="mb-5 flex gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={tab === t.id ? "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-900" : "flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"}
            style={tab === t.id ? { background: "#FFD100" } : {}}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* 达人矩阵详情 */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">达人矩阵详情</h2>
          <p className="mt-0.5 text-xs text-gray-400">仅新媒体传播、生态伙伴和公司事务部、核心本地商业层级可见</p>
        </div>
        <p className="shrink-0 text-xs text-gray-400">共 {totalCreators} 位达人 · 点击卡片查看作品明细</p>
      </div>

      {/* 达人卡片 */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CREATORS.map((c) => (
          <article key={c.mis} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-gray-900" style={{ background: "#FFD100" }}>
                {c.name.slice(0, 1)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-400">MIS：{c.mis}</div>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <div><div className="text-lg font-bold text-gray-900">{c.works}</div><div className="text-xs text-gray-400">作品数</div></div>
              <div><div className="text-lg font-bold text-gray-900">{c.activities}</div><div className="text-xs text-gray-400">参与活动</div></div>
              <div><div className="text-lg font-bold text-gray-900">{c.platforms}</div><div className="text-xs text-gray-400">覆盖平台</div></div>
            </div>
            <div className="mb-3 text-center text-xs text-gray-300">{c.platforms ? "" : "暂无平台数据"}</div>
            <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
              <span className="text-gray-400">联系方式：</span>
              <span className="flex items-center gap-1.5">{c.phone} <Copy className="h-3.5 w-3.5 text-gray-300" /></span>
            </div>
            {c.platformTag && (
              <span className="mb-3 inline-flex items-center gap-1 rounded bg-gray-900 px-2 py-0.5 text-xs text-white">
                {c.platformTag} <ExternalLink className="h-3 w-3" />
              </span>
            )}
            <div className="text-xs text-gray-400">最近提交：{c.lastSubmit}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

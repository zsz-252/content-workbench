"use client";

import { useState } from "react";
import { Inbox, Plus, ChevronRight, ClipboardList, X, Users } from "lucide-react";

type Activity = {
  id: number;
  name: string;
  status: "进行中" | "即将开始";
  desc: string;
  range: string;
  target: number;
  collected: number;
  participants: number;
};

const INITIAL: Activity[] = [
  {
    id: 1,
    name: "9月神券节达人视频回收",
    status: "进行中",
    desc: "回收神券节期间达人发布的视频链接，用于活动复盘与流量激励核算。请在活动结束一周内提交。",
    range: "2026-09-01 ~ 2026-09-30",
    target: 50,
    collected: 12,
    participants: 34,
  },
  {
    id: 2,
    name: "小店故事探店内容登记",
    status: "进行中",
    desc: "BD 与商家账号发布的探店视频统一登记，沉淀优质案例进入案例库。",
    range: "2026-09-05 ~ 2026-10-05",
    target: 30,
    collected: 7,
    participants: 18,
  },
  {
    id: 3,
    name: "国庆黄金周传播素材回收",
    status: "即将开始",
    desc: "面向全体达人收集国庆期间发布的图文与视频链接，按平台分类统计。",
    range: "2026-10-01 ~ 2026-10-15",
    target: 80,
    collected: 0,
    participants: 0,
  },
];

export default function CollectionPage() {
  const [activities, setActivities] = useState(INITIAL);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [target, setTarget] = useState("50");

  const create = () => {
    if (!name.trim()) return;
    setActivities((prev) => [{
      id: Date.now(),
      name: name.trim(),
      status: "即将开始",
      desc: desc.trim() || "暂无描述",
      range: "2026-09-16 ~ 2026-10-16",
      target: Math.max(1, parseInt(target) || 50),
      collected: 0,
      participants: 0,
    }, ...prev]);
    setShowCreate(false); setName(""); setDesc(""); setTarget("50");
  };

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFD100" }}>
            <Inbox className="h-5 w-5 text-gray-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">发布回收</h1>
            <p className="mt-1 text-sm text-gray-500">按活动追踪达人内容链接的提交与回收进度</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <ClipboardList className="h-4 w-4" /> 我的问卷
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-900 hover:brightness-95" style={{ background: "#FFD100" }}>
            <Plus className="h-4 w-4" /> 新建活动
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        作品集演示：活动与回收数据均为虚构示例。
      </div>

      <div className="space-y-4">
        {activities.map((a) => {
          const pct = Math.min(100, Math.round((a.collected / a.target) * 100));
          return (
            <div key={a.id} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">{a.name}</h2>
                    <span className={a.status === "进行中"
                      ? "rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700"
                      : "rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"}>{a.status}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-1 text-sm text-gray-500">{a.desc}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span>{a.range}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{a.participants} 人参与</span>
                  </div>
                </div>
                <button className="mt-1 shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-gray-500">已回收 <span className="font-semibold text-gray-900">{a.collected}</span> 条</span>
                  <span className="text-gray-400">{a.collected} / {a.target} 条（{pct}%）</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#FFD100" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">新建回收活动</h3>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <label className="mb-1 block text-sm font-medium text-gray-700">活动名称 <span className="text-red-500">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：双11达人视频回收"
              className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-yellow-400 focus:bg-white" />
            <label className="mb-1 block text-sm font-medium text-gray-700">活动描述</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="回收范围、提交要求、截止时间说明…"
              className="mb-3 min-h-20 w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-yellow-400 focus:bg-white" />
            <label className="mb-1 block text-sm font-medium text-gray-700">目标回收条数</label>
            <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" min={1}
              className="mb-5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-yellow-400 focus:bg-white" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={create} disabled={!name.trim()}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-900 hover:brightness-95 disabled:opacity-50" style={{ background: "#FFD100" }}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Layers, Megaphone, Pencil, Plus, Trash2, X } from "lucide-react";

const PLATFORMS = ["视频号", "抖音", "小红书", "B站"] as const;

const PLATFORM_STYLE: Record<string, string> = {
  视频号: "bg-green-600 text-white",
  抖音: "bg-gray-900 text-white",
  小红书: "bg-rose-500 text-white",
  B站: "bg-sky-500 text-white",
};

const STATUS_OPTIONS = ["进行中", "即将开始", "报名中"] as const;

const STATUS_STYLE: Record<string, { wrap: string; dot: string }> = {
  进行中: { wrap: "bg-green-50 text-green-600", dot: "bg-green-400" },
  即将开始: { wrap: "bg-blue-50 text-blue-600", dot: "bg-blue-400" },
  报名中: { wrap: "bg-amber-50 text-amber-600", dot: "bg-amber-400" },
};

type Activity = {
  id: string;
  name: string;
  shortName: string;
  timeRange: string;
  status: string;
  platforms: string[];
  intro: string;
  requirements: string[];
};

const INITIAL: Activity[] = [
  { id: "a1", name: "城市烟火气·夏日食光季", shortName: "夏日食光", timeRange: "08.01 - 08.31", status: "进行中", platforms: ["小红书", "视频号"], intro: "围绕夏夜街边小店的真实场景，征集探店与人物故事内容。", requirements: ["单条视频时长 60 秒以上", "需出镜真实门店环境", "标题含活动统一话题标签"] },
  { id: "a2", name: "周末去哪儿·小城慢旅计划", shortName: "小城慢旅", timeRange: "09.05 - 09.28", status: "即将开始", platforms: ["抖音", "小红书"], intro: "聚焦两天一夜的低成本周末路线，突出交通、住宿与体验的组合价值。", requirements: ["需包含完整路线信息", "提供人均花费参考", "至少 3 个实拍场景"] },
  { id: "a3", name: "小店成长记·经营者说", shortName: "经营者说", timeRange: "08.15 - 09.15", status: "报名中", platforms: ["视频号", "B站"], intro: "邀请社区小店经营者讲述真实经营决策与转折，沉淀可复用的经营方法。", requirements: ["以人物访谈为主要形式", "原声占比不低于 70%", "数据需可追溯"] },
];

const EMPTY = { name: "", shortName: "", timeRange: "", status: "进行中", platforms: [] as string[], intro: "", requirements: "" };

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  const counts = useMemo(() => ({
    total: activities.length,
    running: activities.filter((a) => a.status === "进行中").length,
    upcoming: activities.filter((a) => a.status !== "进行中").length,
  }), [activities]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setOpen(true); };

  const openEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({ name: a.name, shortName: a.shortName, timeRange: a.timeRange, status: a.status, platforms: a.platforms, intro: a.intro, requirements: a.requirements.join("\n") });
    setOpen(true);
  };

  const togglePlatform = (p: string) => setForm((f) => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p] }));

  const save = () => {
    if (!form.name.trim()) return;
    const payload: Activity = {
      id: editingId ?? `a${Date.now()}`,
      name: form.name.trim(),
      shortName: form.shortName.trim() || form.name.trim().slice(0, 6),
      timeRange: form.timeRange.trim() || "待定",
      status: form.status,
      platforms: form.platforms,
      intro: form.intro.trim(),
      requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    setActivities((prev) => editingId ? prev.map((a) => (a.id === editingId ? payload : a)) : [payload, ...prev]);
    setOpen(false);
  };

  const remove = (id: string) => setActivities((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-300"><Megaphone className="h-5 w-5" /></div>
          <div><h1 className="text-xl font-bold text-gray-900">活动管理</h1><p className="mt-1 text-sm text-gray-500">统一维护征集活动的周期、平台与参与要求</p></div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"><Plus className="h-4 w-4" />新建活动</button>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">作品集演示：活动内容与平台名称均为虚构示例，新增和修改仅保存在当前页面，刷新后恢复初始数据。</div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {([["活动总数", counts.total, Layers], ["进行中", counts.running, Megaphone], ["待启动 / 报名中", counts.upcoming, CalendarDays]] as const).map(([label, value, Icon]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
            <Icon className="mb-4 h-5 w-5 text-gray-400" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activities.map((a) => {
          const st = STATUS_STYLE[a.status] ?? STATUS_STYLE["进行中"];
          return (
            <article key={a.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${st.wrap}`}><span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />{a.status}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} title="编辑" className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(a.id)} title="删除" className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <h2 className="text-base font-semibold leading-6 text-gray-900">{a.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400"><CalendarDays className="h-3.5 w-3.5" />{a.timeRange}</p>
              <p className="mt-3 min-h-10 text-sm leading-5 text-gray-500">{a.intro}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{a.platforms.map((p) => <span key={p} className={`rounded px-2 py-0.5 text-[11px] font-medium ${PLATFORM_STYLE[p] ?? "bg-gray-500 text-white"}`}>{p}</span>)}</div>
              {a.requirements.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="mb-2 text-xs font-medium text-gray-600">参与要求</p>
                  <ul className="space-y-1">{a.requirements.map((r) => <li key={r} className="flex gap-2 text-xs leading-5 text-gray-500"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-300" />{r}</li>)}</ul>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {!activities.length && <div className="rounded-xl bg-white py-20 text-center text-sm text-gray-400">还没有活动，点击右上角新建一个。</div>}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingId ? "编辑活动" : "新建活动"}</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium">活动名称</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：城市烟火气·夏日食光季" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-400" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1.5 block text-sm font-medium">活动简称</label><input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} placeholder="夏日食光" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-400" /></div>
                <div><label className="mb-1.5 block text-sm font-medium">活动周期</label><input value={form.timeRange} onChange={(e) => setForm({ ...form, timeRange: e.target.value })} placeholder="08.01 - 08.31" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-400" /></div>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium">活动状态</label><div className="flex gap-2">{STATUS_OPTIONS.map((s) => <button key={s} onClick={() => setForm({ ...form, status: s })} className={form.status === s ? "rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white" : "rounded-lg px-3 py-1.5 text-sm text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}>{s}</button>)}</div></div>
              <div><label className="mb-1.5 block text-sm font-medium">投放平台</label><div className="flex flex-wrap gap-2">{PLATFORMS.map((p) => <button key={p} onClick={() => togglePlatform(p)} className={form.platforms.includes(p) ? `rounded-lg px-3 py-1.5 text-sm ${PLATFORM_STYLE[p]}` : "rounded-lg px-3 py-1.5 text-sm text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}>{p}</button>)}</div></div>
              <div><label className="mb-1.5 block text-sm font-medium">活动介绍</label><textarea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} placeholder="一句话说明活动的内容方向和征集重点" className="min-h-20 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-400" /></div>
              <div><label className="mb-1.5 block text-sm font-medium">参与要求</label><textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="每行一条要求" className="min-h-24 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-400" /><p className="mt-1 text-xs text-gray-400">每行一条，保存时自动拆分为列表。</p></div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50">取消</button>
              <button onClick={save} disabled={!form.name.trim()} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

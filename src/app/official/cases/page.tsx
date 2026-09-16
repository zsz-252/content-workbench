"use client";

import { useMemo, useState } from "react";
import { Flame, BookOpen, Trophy, Sparkles, RefreshCw, ListOrdered, TrendingUp } from "lucide-react";
import Link from "next/link";

type Brief = {
  category: string;
  source: string;
  title: string;
  summary: string;
};

const MAIN_TABS = ["每日热点", "商家案例", "营销案例"] as const;
const SUB_SOURCES = [
  { name: "行业资讯", sub: "虎嗅早报 · 36氪8点1氪" },
  { name: "抖音热榜", sub: "实时热度排行" },
  { name: "微博热榜", sub: "实时热度排行" },
];
const DATES = ["最新", "09-15", "09-14", "09-11", "09-10", "09-03", "09-01", "08-31", "08-27"];

// 全部为虚构示例内容
const BRIEFS: Brief[] = [
  { category: "平台动态", source: "人人都是产品经理", title: "抖音9月新规落地流量逻辑重构", summary: "抖音9月完成覆盖内容审核、算法分发、直播、MCN、电商的系统性生态升级，短视频流量池分配更强调完播与互动质量，搬运与低质混剪流量进一步压缩。" },
  { category: "平台动态", source: "亿邦动力", title: "TikTokShop美区开放图文挂车权限", summary: "正值2026年黑五备战关键期，TikTok Shop美区面向全品类优质跨境POP商家及达人开放图文挂车权限，图文种草正式成为短视频之外的第二条转化链路。" },
  { category: "消费趋势", source: "微博-零售日报", title: "高价月饼礼盒遇冷散装月饼卖爆", summary: "中秋临近，月饼市场两极分化明显：高价礼盒提前打折仍遇冷，7至8元的散装月饼柜台人气最高，消费理性化继续压制节日溢价，消费者已看懂礼盒溢价套路。" },
  { category: "平台动态", source: "微博-电商日报", title: "中秋电商大促扎堆抖音商城定档", summary: "中秋档电商竞争白热化：天猫中秋团圆季发放全品类券，京东中秋专场持续，抖音商城中秋大促定档，商家可选择立减或一件直降玩法。" },
  { category: "行业政策", source: "新浪新闻", title: "多地发布双节价格告诫严查哄抬物价", summary: "中秋国庆双节临近，多地市场监管部门密集发布价格提醒告诫书，针对月饼、大闸蟹、餐饮、旅游住宿等重点场景，不得哄抬价格、虚构原价、先提价后打折。" },
  { category: "品牌营销", source: "微博-大白兔官方", title: "大白兔联名崩坏星穹铁道快闪开启", summary: "国民糖果大白兔与崩坏星穹铁道的联名礼盒线上开售，线下快闪多城接力开启，二次元IP已是餐饮零售获取年轻客群的标准动作。" },
  { category: "品牌营销", source: "中国消费者报", title: "服贸会首联名潮玩IP文创爆火", summary: "2026年服贸会首次与潮玩IP跨界联名，多品类联名文创成为热门纪念伴手礼，潮玩IP正成为大型会展与公共文化面向年轻人的沟通媒介。" },
];

export default function CasesPage() {
  const [mainTab, setMainTab] = useState<(typeof MAIN_TABS)[number]>("每日热点");
  const [subSource, setSubSource] = useState("行业资讯");
  const [date, setDate] = useState("最新");

  const briefs = useMemo(() => BRIEFS, []);

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      {/* 页头 */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFD100" }}>
          <Flame className="h-5 w-5 text-gray-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">案例库</h1>
          <p className="mt-0.5 text-sm text-gray-500">每日热点追踪 · 营销案例解读 · 一键生成选题脚本</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        作品集演示：以下热点资讯均为虚构示例，来源名称沿用了真实媒体样式仅用于还原产品交互。
      </div>

      {/* 主 tab */}
      <div className="mb-4 flex gap-2 rounded-2xl bg-white p-2 ring-1 ring-gray-100">
        {MAIN_TABS.map((t) => (
          <button key={t} onClick={() => setMainTab(t)}
            className={mainTab === t ? "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-900" : "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm text-gray-500 hover:text-gray-800"}
            style={mainTab === t ? { background: "#FFF3C4" } : {}}>
            {t === "每日热点" && <Flame className="h-4 w-4" />}
            {t === "商家案例" && <Trophy className="h-4 w-4" />}
            {t === "营销案例" && <BookOpen className="h-4 w-4" />}
            {t}
          </button>
        ))}
      </div>

      {/* 子来源 */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {SUB_SOURCES.map((s) => (
          <button key={s.name} onClick={() => setSubSource(s.name)}
            className={subSource === s.name ? "rounded-xl bg-white p-3 text-left ring-2 ring-gray-900" : "rounded-xl bg-white p-3 text-left ring-1 ring-gray-100 hover:ring-gray-300"}>
            <div className="text-sm font-semibold text-gray-900">{s.name}</div>
            <div className="mt-0.5 text-xs text-gray-400">{s.sub}</div>
          </button>
        ))}
      </div>

      {/* 提示条 */}
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <Sparkles className="h-4 w-4 shrink-0" />
        点击右侧黄色「做选题」按钮，将自动跳转脚本生成器并生成对应脚本
      </div>

      {/* 日期 + 更新 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <RefreshCw className="h-4 w-4" />
          2026-09-16 · 来自数据库
        </div>
        <button className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-900" style={{ background: "#FFD100" }}>
          <RefreshCw className="h-4 w-4" /> 一键更新
        </button>
      </div>

      {/* 日期筛选 */}
      <div className="mb-5 flex flex-wrap gap-2">
        {DATES.map((d) => (
          <button key={d} onClick={() => setDate(d)}
            className={date === d ? "rounded-full px-4 py-1.5 text-sm font-medium text-gray-900" : "rounded-full bg-white px-4 py-1.5 text-sm text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"}
            style={date === d ? { background: "#FFD100" } : {}}>
            {d}
          </button>
        ))}
      </div>

      {/* 资讯列表 */}
      <div className="space-y-3">
        {briefs.map((b) => (
          <article key={b.title} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">{b.category}</span>
                  <span className="text-xs text-gray-400">{b.source}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900">{b.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-gray-500">{b.summary}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Link href="/official/script-gen"
                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 hover:brightness-95"
                  style={{ background: "#FFD100" }}>
                  <ListOrdered className="h-4 w-4" /> 做选题
                </Link>
                <span className="text-xs text-gray-400">口播解读</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        行业资讯整合自虎嗅早报、36氪8点1氪；热榜数据来自抖音、微博实时榜单，每日自动同步。
      </p>
    </div>
  );
}

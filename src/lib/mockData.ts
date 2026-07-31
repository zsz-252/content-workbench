// ─────────────────────────────────────────────────────────────────────────────
// 演示数据层
//
// 本文件所有数据均为虚构，仅用于作品集展示，不含任何真实业务信息。
// 账号名称、数据指标、视频标题等全部为示例内容。
// ─────────────────────────────────────────────────────────────────────────────

export interface DemoAccount {
  id: string;
  name: string;
  color: string;
  textColor: string;
  short: string;
  followers: number;
  yesterdayViews: number;
  /** 全年传播声量目标 */
  targetVoice: number;
  /** 粉丝目标 */
  targetFollowers: number;
  /** 百万爆款目标条数 */
  targetHits: number;
}

export interface DemoTrend {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  follows: number;
}

export interface DemoVideo {
  id: string;
  accountId: string;
  title: string;
  pubDate: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  thumbUps: number;
  followCount: number;
}

// ─── 账号（全部虚构） ─────────────────────────────────────────────────────────

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "food", name: "城市美食观察", short: "美食",
    color: "#FFD100", textColor: "#78600A",
    followers: 412_000, yesterdayViews: 186_400,
    targetVoice: 100_000_000, targetFollowers: 500_000, targetHits: 10,
  },
  {
    id: "life", name: "本地生活笔记", short: "生活",
    color: "#FF6B35", textColor: "#fff",
    followers: 358_000, yesterdayViews: 142_900,
    targetVoice: 80_000_000, targetFollowers: 500_000, targetHits: 10,
  },
  {
    id: "travel", name: "周末去哪儿", short: "出行",
    color: "#2EC4B6", textColor: "#fff",
    followers: 231_000, yesterdayViews: 97_300,
    targetVoice: 45_000_000, targetFollowers: 300_000, targetHits: 5,
  },
  {
    id: "health", name: "健康生活指南", short: "健康",
    color: "#7B61FF", textColor: "#fff",
    followers: 168_000, yesterdayViews: 63_800,
    targetVoice: 30_000_000, targetFollowers: 200_000, targetHits: 5,
  },
  {
    id: "retail", name: "小店成长记", short: "零售",
    color: "#00A6ED", textColor: "#fff",
    followers: 124_000, yesterdayViews: 51_200,
    targetVoice: 25_000_000, targetFollowers: 200_000, targetHits: 3,
  },
  {
    id: "flash", name: "即时零售观察", short: "闪购",
    color: "#F45B69", textColor: "#fff",
    followers: 96_000, yesterdayViews: 38_700,
    targetVoice: 20_000_000, targetFollowers: 150_000, targetHits: 3,
  },
];

// ─── 确定性伪随机（保证每次渲染数据一致） ───────────────────────────────────────

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 1_000_000;
  return h;
}

// ─── 趋势数据 ────────────────────────────────────────────────────────────────

export function getTrends(accountId: string, days = 30): DemoTrend[] {
  const rand = seeded(hashCode(accountId) + days);
  const acc = DEMO_ACCOUNTS.find((a) => a.id === accountId) ?? DEMO_ACCOUNTS[0];
  const base = acc.yesterdayViews;
  const out: DemoTrend[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // 周末略高，模拟真实波动
    const weekendBoost = [0, 6].includes(d.getDay()) ? 1.18 : 1;
    const views = Math.round(base * (0.65 + rand() * 0.7) * weekendBoost);
    out.push({
      date: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      views,
      likes: Math.round(views * (0.028 + rand() * 0.02)),
      comments: Math.round(views * (0.004 + rand() * 0.004)),
      shares: Math.round(views * (0.006 + rand() * 0.006)),
      follows: Math.round(views * (0.002 + rand() * 0.003)),
    });
  }
  return out;
}

// ─── 视频列表 ────────────────────────────────────────────────────────────────

const TITLE_POOL: Record<string, string[]> = {
  food: [
    "开在巷子里的面馆，凌晨两点还在排队",
    "这家烧烤摊只卖三样菜，年入百万",
    "夫妻店坚持二十年，只做一道菜",
    "人均30的自助火锅，老板到底怎么赚钱",
    "从摆摊到六家分店，他只做对了一件事",
    "藏在菜市场二楼的私房菜，凭什么天天满座",
  ],
  life: [
    "小区门口这家店，凭什么开了十五年",
    "月租三千的社区超市，一年做了两百万",
    "为什么便利店越来越多，生意却越来越难",
    "老城区改造后，这些小店活下来了吗",
    "一个人开店，他怎么撑过淡季",
    "夜市摊主的一天：从下午四点到凌晨三点",
  ],
  travel: [
    "周末两天一夜，人均五百的小众路线",
    "不用请假的城市周边游，这条最划算",
    "县城旅游为什么突然火了",
    "民宿老板娘：旺季一晚翻三倍值不值",
    "高铁两小时能到的宝藏小城",
    "露营热退潮后，营地老板们怎么样了",
  ],
  health: [
    "社区药店转型：从卖药到做健康管理",
    "年轻人开始养生，这门生意有多大",
    "中医馆排队三小时，是玄学还是刚需",
    "体检套餐怎么选才不踩坑",
    "健身房跑路潮之后，私教们去哪了",
    "睡眠经济：一个枕头卖八百有人买吗",
  ],
  retail: [
    "十平米小店，月流水十二万",
    "开店三年，他把成本压到了极限",
    "为什么有的小店永远在打折",
    "从一个人到十个人，小店的扩张陷阱",
    "县城小店老板：我不做线上就活不下去",
    "同一条街，为什么隔壁生意比我好",
  ],
  flash: [
    "半小时送达背后，这些店做对了什么",
    "即时零售爆发，谁在闷声赚钱",
    "便利店做外卖，能多赚多少",
    "夜间订单占四成，他怎么排班",
    "从日单五十到五百，用了多久",
    "小店做即时零售，最难的是什么",
  ],
};

export function getVideos(accountId: string, count = 24): DemoVideo[] {
  const rand = seeded(hashCode(accountId) * 7);
  const pool = TITLE_POOL[accountId] ?? TITLE_POOL.food;
  const acc = DEMO_ACCOUNTS.find((a) => a.id === accountId) ?? DEMO_ACCOUNTS[0];
  const out: DemoVideo[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 3 - Math.floor(rand() * 2));
    // 少量爆款
    const isHit = rand() > 0.86;
    const views = isHit
      ? Math.round(1_000_000 + rand() * 2_400_000)
      : Math.round(acc.yesterdayViews * (0.3 + rand() * 1.6));
    out.push({
      id: `${accountId}-${i}`,
      accountId,
      title: pool[i % pool.length] + (i >= pool.length ? `（${Math.floor(i / pool.length) + 1}）` : ""),
      pubDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      views,
      likes: Math.round(views * (0.025 + rand() * 0.025)),
      comments: Math.round(views * (0.003 + rand() * 0.005)),
      shares: Math.round(views * (0.005 + rand() * 0.008)),
      thumbUps: Math.round(views * (0.012 + rand() * 0.012)),
      followCount: Math.round(views * (0.0015 + rand() * 0.003)),
    });
  }
  return out;
}

// ─── 汇总指标 ────────────────────────────────────────────────────────────────

export function getAccountStats(accountId: string) {
  const videos = getVideos(accountId, 40);
  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const hits = videos.filter((v) => v.views >= 1_000_000).length;
  const acc = DEMO_ACCOUNTS.find((a) => a.id === accountId) ?? DEMO_ACCOUNTS[0];
  return {
    totalViews,
    hits,
    videoCount: videos.length,
    followers: acc.followers,
    voiceProgress: Math.min(100, Math.round((totalViews / acc.targetVoice) * 100)),
    followerProgress: Math.min(100, Math.round((acc.followers / acc.targetFollowers) * 100)),
    hitProgress: Math.min(100, Math.round((hits / acc.targetHits) * 100)),
  };
}

/** 受众画像（虚构） */
export const DEMO_AUDIENCE = {
  gender: [
    { label: "女性", value: 58 },
    { label: "男性", value: 42 },
  ],
  age: [
    { label: "18-23", value: 14 },
    { label: "24-30", value: 36 },
    { label: "31-40", value: 31 },
    { label: "41-50", value: 13 },
    { label: "50+", value: 6 },
  ],
  city: [
    { label: "一线", value: 28 },
    { label: "新一线", value: 33 },
    { label: "二线", value: 21 },
    { label: "三线及以下", value: 18 },
  ],
};

export function fmt(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + "亿";
  if (n >= 10_000) return (n / 10_000).toFixed(1) + "万";
  return String(n);
}

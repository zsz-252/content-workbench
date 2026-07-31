// ─── 多模型 Provider 配置 ─────────────────────────────────────────────────────
// 所有 Provider 均使用 OpenAI 兼容协议，因此可共用同一个调用适配器。
// 模型型号核对时间：2026-07-28

export interface ModelOption {
  id: string;
  label: string;
  desc?: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  models: ModelOption[];
  keyUrl: string;
  /** 允许用户自定义 baseUrl（仅 custom 使用） */
  editableBaseUrl?: boolean;
  note?: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    keyUrl: "https://platform.deepseek.com/api_keys",
    models: [
      { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash", desc: "快速经济，日常够用" },
      { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", desc: "旗舰版，质量最好" },
    ],
    note: "旧型号 deepseek-chat / deepseek-reasoner 已于 2026-07-24 下线",
  },
  {
    id: "qwen",
    name: "通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    keyUrl: "https://bailian.console.aliyun.com/",
    models: [
      { id: "qwen3.5-flash", label: "Qwen3.5 Flash", desc: "轻量快速" },
      { id: "qwen3.5-plus", label: "Qwen3.5 Plus", desc: "通用旗舰" },
    ],
  },
  {
    id: "kimi",
    name: "Kimi / 月之暗面",
    baseUrl: "https://api.moonshot.cn/v1",
    keyUrl: "https://platform.moonshot.cn/console/api-keys",
    models: [
      { id: "kimi-k3", label: "Kimi K3", desc: "2.8T 参数，100 万上下文" },
      { id: "kimi-k2.7", label: "Kimi K2.7", desc: "上一代，成本更低" },
    ],
  },
  {
    id: "zhipu",
    name: "智谱 GLM",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    keyUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    models: [
      { id: "glm-5.2", label: "GLM-5.2", desc: "最新旗舰" },
      { id: "glm-4-flash", label: "GLM-4-Flash", desc: "免费额度友好" },
    ],
  },
  {
    id: "custom",
    name: "自定义（OpenAI 兼容）",
    baseUrl: "",
    keyUrl: "",
    editableBaseUrl: true,
    models: [],
    note: "任何兼容 OpenAI /chat/completions 协议的服务都可以填在这里",
  },
];

export function getProvider(id: string): ProviderConfig | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

// ─── 设置的读写（localStorage） ────────────────────────────────────────────────

const STORAGE_KEY = "ai-settings-v1";

export interface AISettings {
  providerId: string;
  model: string;
  apiKey: string;
  /** 仅 custom provider 使用 */
  customBaseUrl?: string;
  customModel?: string;
}

export const DEFAULT_SETTINGS: AISettings = {
  providerId: "deepseek",
  model: "deepseek-v4-flash",
  apiKey: "",
  customBaseUrl: "",
  customModel: "",
};

export function loadSettings(): AISettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AISettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("ai-settings-changed"));
  } catch {
    /* 忽略写入失败（隐私模式等） */
  }
}

export function clearSettings() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("ai-settings-changed"));
}

/** 解析出实际请求要用的 baseUrl / model */
export function resolveEndpoint(s: AISettings): { baseUrl: string; model: string } {
  if (s.providerId === "custom") {
    return {
      baseUrl: (s.customBaseUrl || "").replace(/\/+$/, ""),
      model: s.customModel || "",
    };
  }
  const p = getProvider(s.providerId);
  return {
    baseUrl: (p?.baseUrl || "").replace(/\/+$/, ""),
    model: s.model || p?.models[0]?.id || "",
  };
}

export function isConfigured(s: AISettings): boolean {
  const { baseUrl, model } = resolveEndpoint(s);
  return Boolean(s.apiKey.trim() && baseUrl && model);
}

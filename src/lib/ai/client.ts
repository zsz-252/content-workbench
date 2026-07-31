import { AISettings, loadSettings, resolveEndpoint, getProvider } from "./providers";

export interface ChatOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
  /** 流式回调，每次收到增量文本时触发 */
  onDelta?: (chunk: string, full: string) => void;
  signal?: AbortSignal;
}

export class AIError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "AIError";
  }
}

/** 把接口返回的错误整理成人话 */
function humanizeError(status: number, body: string, providerName: string): string {
  const snippet = body.slice(0, 300);
  switch (status) {
    case 401:
      return `API Key 无效或已过期，请到「${providerName}」控制台确认后重新填写。`;
    case 402:
      return `账户余额不足，请到「${providerName}」控制台充值。`;
    case 403:
      return `没有该模型的访问权限，可能需要在「${providerName}」控制台开通对应模型。`;
    case 404:
      return `模型不存在或接口地址不对。请检查模型名称是否已下线（${snippet}）。`;
    case 429:
      return `请求太频繁或超出额度限制，稍等一下再试。`;
    default:
      if (status >= 500) return `${providerName} 服务端错误（${status}），通常稍后重试即可。`;
      return `请求失败（${status}）：${snippet}`;
  }
}

/**
 * 调用大模型。默认走流式，便于实时展示生成过程。
 */
export async function chat(
  prompt: string,
  opts: ChatOptions = {},
  settingsOverride?: AISettings
): Promise<string> {
  const settings = settingsOverride ?? loadSettings();
  const { baseUrl, model } = resolveEndpoint(settings);
  const providerName = getProvider(settings.providerId)?.name || "模型服务";

  if (!settings.apiKey.trim()) {
    throw new AIError("还没有配置 API Key，请先点右上角「AI 设置」填写。");
  }
  if (!baseUrl || !model) {
    throw new AIError("模型配置不完整，请检查「AI 设置」里的接口地址和模型名称。");
  }

  const messages: { role: string; content: string }[] = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  messages.push({ role: "user", content: prompt });

  const stream = Boolean(opts.onDelta);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.3,
        max_tokens: opts.maxTokens ?? 8192,
        stream,
      }),
      signal: opts.signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    // 浏览器直连最常见的失败原因就是 CORS
    throw new AIError(
      `无法连接到 ${providerName}。可能是网络不通，或该服务不允许浏览器直接调用（CORS 限制）。`
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AIError(humanizeError(res.status, body, providerName), res.status);
  }

  if (!stream) {
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "";
  }

  // ─── 解析 SSE 流 ───────────────────────────────────────────────────────────
  const reader = res.body?.getReader();
  if (!reader) throw new AIError("当前浏览器不支持流式读取。");

  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE 以空行分隔事件，按行处理
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          opts.onDelta?.(delta, full);
        }
      } catch {
        // 单个分片解析失败不影响整体
      }
    }
  }

  return full;
}

/**
 * 从模型输出里稳健地提取 JSON。
 * 模型经常会包裹 ```json 代码块或前后加解释文字。
 */
export function extractJSON<T = unknown>(raw: string): T {
  if (!raw || !raw.trim()) {
    throw new AIError("模型没有返回任何内容，请重试。");
  }

  // 1. 优先提取 ```json ... ``` 代码块
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates: string[] = [];
  if (fence?.[1]) candidates.push(fence[1].trim());

  // 2. 退回到第一个 { 到最后一个 } 之间的内容
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) {
    candidates.push(raw.slice(start, end + 1));
  }

  candidates.push(raw.trim());

  for (const c of candidates) {
    try {
      return JSON.parse(c) as T;
    } catch {
      // 尝试修掉尾随逗号后再解析一次
      try {
        return JSON.parse(c.replace(/,(\s*[}\]])/g, "$1")) as T;
      } catch {
        continue;
      }
    }
  }

  throw new AIError("模型返回的不是合法 JSON，可以再生成一次试试。");
}

/** 连通性自检：发一个极短请求验证 Key 是否可用 */
export async function testConnection(settings: AISettings): Promise<string> {
  const out = await chat(
    "请只回复两个字：正常",
    { maxTokens: 32, temperature: 0 },
    settings
  );
  return out.trim();
}

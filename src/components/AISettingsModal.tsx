"use client";

import { useState, useEffect } from "react";
import {
  PROVIDERS, getProvider, loadSettings, saveSettings, clearSettings,
  type AISettings,
} from "@/lib/ai/providers";
import { testConnection } from "@/lib/ai/client";
import { X, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ExternalLink, Trash2 } from "lucide-react";

export default function AISettingsModal({
  open, onClose,
}: { open: boolean; onClose: () => void }) {
  const [s, setS] = useState<AISettings>(loadSettings());
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (open) {
      setS(loadSettings());
      setTestResult(null);
      setShowKey(false);
    }
  }, [open]);

  if (!open) return null;

  const provider = getProvider(s.providerId);
  const isCustom = s.providerId === "custom";

  const update = (patch: Partial<AISettings>) => {
    setS((prev) => ({ ...prev, ...patch }));
    setTestResult(null);
  };

  const onProviderChange = (pid: string) => {
    const p = getProvider(pid);
    update({ providerId: pid, model: p?.models[0]?.id ?? "" });
  };

  const handleSave = () => {
    saveSettings(s);
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const out = await testConnection(s);
      setTestResult({ ok: true, msg: `连接成功，模型回复：${out || "(空)"}` });
    } catch (e) {
      setTestResult({ ok: false, msg: (e as Error).message });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    clearSettings();
    setS(loadSettings());
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">AI 设置</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              选择模型并填入你自己的 API Key
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {/* 安全提示 */}
          <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
            Key 只保存在你自己浏览器的本地存储里，不会上传到任何服务器，也不会被其他人看到。
            换一台电脑或清理浏览器数据后需要重新填写。
          </div>

          {/* 服务商 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              模型服务商
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onProviderChange(p.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    s.providerId === p.id
                      ? "border-yellow-400 bg-yellow-50 font-medium text-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 模型 */}
          {!isCustom && provider && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">模型</label>
              <div className="space-y-1.5">
                {provider.models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => update({ model: m.id })}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                      s.model === m.id
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm text-gray-900">{m.label}</span>
                    {m.desc && <span className="text-xs text-gray-400">{m.desc}</span>}
                  </button>
                ))}
              </div>
              {provider.note && (
                <p className="mt-1.5 text-xs text-gray-400">{provider.note}</p>
              )}
            </div>
          )}

          {/* 自定义接口 */}
          {isCustom && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  接口地址（Base URL）
                </label>
                <input
                  value={s.customBaseUrl ?? ""}
                  onChange={(e) => update({ customBaseUrl: e.target.value })}
                  placeholder="https://your-endpoint.com/v1"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-400"
                />
                <p className="mt-1 text-xs text-gray-400">
                  不用带 /chat/completions，系统会自动拼接
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  模型名称
                </label>
                <input
                  value={s.customModel ?? ""}
                  onChange={(e) => update({ customModel: e.target.value })}
                  placeholder="例如 qwen-plus"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-400"
                />
              </div>
            </>
          )}

          {/* API Key */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">API Key</label>
              {provider?.keyUrl && (
                <a
                  href={provider.keyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  去哪申请 <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={s.apiKey}
                onChange={(e) => update({ apiKey: e.target.value })}
                placeholder="sk-..."
                autoComplete="off"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm outline-none focus:border-yellow-400"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 测试结果 */}
          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs leading-relaxed ${
                testResult.ok
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span>{testResult.msg}</span>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> 清除已保存的 Key
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={testing || !s.apiKey.trim()}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              测试连接
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

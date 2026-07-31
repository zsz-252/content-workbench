"use client";

interface Props {
  title: string;
  icon: React.ReactNode;
  description: string;
  color?: string;
}

export default function PlaceholderPage({ title, icon, description, color = "#FFD100" }: Props) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color }}>
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">页面迁移中</h2>
        <p className="text-sm text-gray-400">
          该页面正在从 NoCode 平台迁移到独立项目，即将上线
        </p>
      </div>
    </div>
  );
}

"use client";
import PlaceholderPage from "@/components/PlaceholderPage";
import { Network } from "lucide-react";

export default function MatrixHubPage() {
  return (
    <PlaceholderPage
      title="矩阵运营中心"
      icon={<Network className="w-5 h-5 text-gray-900" />}
      description="BD 素材管理 · 状态看板"
    />
  );
}

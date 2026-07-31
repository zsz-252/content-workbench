"use client";
import PlaceholderPage from "@/components/PlaceholderPage";
import { Library } from "lucide-react";

export default function CasesPage() {
  return (
    <PlaceholderPage
      title="案例库"
      icon={<Library className="w-5 h-5 text-gray-900" />}
      description="每日热点 · 商家案例 · 营销案例"
    />
  );
}

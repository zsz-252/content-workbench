"use client";
import PlaceholderPage from "@/components/PlaceholderPage";
import { ShieldCheck } from "lucide-react";

export default function ReviewPage() {
  return (
    <PlaceholderPage
      title="四维审核"
      icon={<ShieldCheck className="w-5 h-5 text-gray-900" />}
      description="合规审核 · 保时洁流程 · AI 预审"
    />
  );
}

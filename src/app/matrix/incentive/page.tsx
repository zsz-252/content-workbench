"use client";
import PlaceholderPage from "@/components/PlaceholderPage";
import { Coins } from "lucide-react";

export default function IncentivePage() {
  return (
    <PlaceholderPage
      title="激励结算"
      icon={<Coins className="w-5 h-5 text-gray-900" />}
      description="BD 激励 · 月度结算 · 爆款奖励"
    />
  );
}

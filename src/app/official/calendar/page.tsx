"use client";
import PlaceholderPage from "@/components/PlaceholderPage";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <PlaceholderPage
      title="营销日历"
      icon={<CalendarDays className="w-5 h-5 text-gray-900" />}
      description="节日节气 · 营销节点 · 视频排期"
    />
  );
}

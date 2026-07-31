"use client";
import PlaceholderPage from "@/components/PlaceholderPage";
import { Inbox } from "lucide-react";

export default function CollectionPage() {
  return (
    <PlaceholderPage
      title="发布回收"
      icon={<Inbox className="w-5 h-5 text-gray-900" />}
      description="素材回收 · 发布跟踪"
    />
  );
}

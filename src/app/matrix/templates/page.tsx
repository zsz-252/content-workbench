"use client";
import PlaceholderPage from "@/components/PlaceholderPage";
import { LayoutTemplate } from "lucide-react";

export default function TemplatesPage() {
  return (
    <PlaceholderPage
      title="内容模板搭建"
      icon={<LayoutTemplate className="w-5 h-5 text-gray-900" />}
      description="视频模板 · 脚本模板"
    />
  );
}

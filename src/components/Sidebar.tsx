"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart2,
  CalendarDays,
  Library,
  ScrollText,
  ShieldCheck,
  Network,
  LayoutTemplate,
  Inbox,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    id: "official",
    label: "官号运营",
    items: [
      { title: "数据看板",   to: "/",                   icon: BarChart2 },
      { title: "营销日历",   to: "/official/calendar",   icon: CalendarDays },
      { title: "案例库",     to: "/official/cases",      icon: Library },
      { title: "脚本生成器", to: "/official/script-gen", icon: ScrollText },
      { title: "六维审核",   to: "/official/review",     icon: ShieldCheck },
    ],
  },
  {
    id: "matrix",
    label: "达人矩阵",
    items: [
      { title: "矩阵运营中心", to: "/matrix/hub",        icon: Network },
      { title: "活动管理",     to: "/matrix/activities",  icon: Megaphone },
      { title: "内容模板搭建", to: "/matrix/templates",  icon: LayoutTemplate },
      { title: "发布回收",     to: "/matrix/collection", icon: Inbox },
    ],
  },
  {
    id: "aivideo",
    label: "AI 视频",
    items: [
      { title: "AI 视频", to: "/aivideo/meijing", icon: Sparkles },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    official: true,
    matrix: true,
    aivideo: true,
  });
  const pathname = usePathname();

  const toggleGroup = (id: string) => {
    if (collapsed) return;
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-gray-900 text-white transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "#FFD100" }}
            >
              <Megaphone className="w-4 h-4 text-gray-900" />
            </div>
            <span className="font-bold text-sm leading-tight text-white">
              新媒体传播
              <br />
              工作台
            </span>
          </div>
        )}
        {collapsed && (
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center mx-auto"
            style={{ background: "#FFD100" }}
          >
            <Megaphone className="w-4 h-4 text-gray-900" />
          </div>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navGroups.map((group) => {
          const isOpen = collapsed ? false : openGroups[group.id];
          return (
            <div key={group.id} className="mb-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors",
                  collapsed && "justify-center px-2"
                )}
              >
                {!collapsed && (
                  <>
                    <span>{group.label}</span>
                    {openGroups[group.id] ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </>
                )}
                {collapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                )}
              </button>

              {(collapsed || isOpen) && (
                <div className={cn("space-y-0.5", !collapsed && "pb-1")}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.to === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.to);
                    return (
                      <Link
                        key={item.to}
                        href={item.to}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-all duration-150",
                          isActive
                            ? "text-gray-900 font-semibold"
                            : "text-gray-300 hover:text-white hover:bg-gray-700",
                          collapsed && "justify-center px-2"
                        )}
                        style={isActive ? { background: "#FFD100" } : {}}
                        title={collapsed ? item.title : undefined}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 折叠按钮 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}

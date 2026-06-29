"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  KanbanSquare,
  Megaphone,
  BarChart3,
  Settings,
  UserCheck,
  Database,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { name: "Buyers", href: "/buyers", icon: UserCheck },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Data Pipeline", href: "/data-pipeline", icon: Database },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
      {/* Brand */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
          <Building2 className="h-3.5 w-3.5 text-black" />
        </div>
        <h1 className="font-bold text-sm tracking-tight">
          <span className="gradient-text">Whole</span>
          <span className="text-[var(--color-text-primary)]">CRM</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
                isActive
                  ? "bg-[var(--color-accent-glow)] text-emerald-400 font-medium"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-emerald-400" : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]")} />
              {item.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
          <div className="relative">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse-ring" />
          </div>
          <div className="text-xs">
            <p className="font-medium text-[var(--color-text-primary)]">Lone Star Property</p>
            <p className="text-[var(--color-text-tertiary)]">Connected · Live</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

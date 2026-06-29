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
    <aside className="w-60 border-r border-zinc-800 bg-zinc-950 flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-zinc-800">
        <h1 className="font-bold text-sm tracking-tight">
          <span className="text-emerald-400">Whole</span>
          <span className="text-zinc-100">CRM</span>
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          Default Org
        </div>
      </div>
    </aside>
  );
}

"use client";

import { memo } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Activity,
  Database,
  Shield,
  Zap,
  Bell,
  Settings,
  Moon,
  Sun,
  User,
  MapPin,
  Inbox,
  AlertCircle,
} from "lucide-react";

const menuItems = [
  { title: "Overview", icon: LayoutDashboard, href: "/admin" },
  { title: "Users", icon: Users, href: "/admin/users" },
  { title: "Places", icon: MapPin, href: "/admin/places" },
  { title: "Requests", icon: Inbox, href: "/admin/requests" },
  { title: "Reports", icon: AlertCircle, href: "/admin/reports" },
  { title: "Reviews", icon: FileText, href: "/admin/reviews" },
  { title: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { title: "Activity", icon: Activity, href: "/admin/activity" },
  { title: "Database", icon: Database, href: "/admin/database" },
  { title: "Security", icon: Shield, href: "/admin/security" },
  { title: "Performance", icon: Zap, href: "/admin/performance" },
  { title: "Notifications", icon: Bell, href: "/admin/notifications" },
  { title: "Settings", icon: Settings, href: "/admin/settings" },
];

export const AdminSidebar = memo(() => {
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link prefetch={false} href="/admin">
                <div className="bg-zinc-900 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black tracking-tight uppercase">
                    Lomhea
                  </span>
                  <span className="truncate text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link prefetch={false} href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
              <span className="font-bold">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/">
                <LayoutDashboard className="rotate-180" />
                <span className="font-bold">Head back home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="#profile">
                <User />
                <span className="font-bold">Admin Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

AdminSidebar.displayName = "AdminSidebar";

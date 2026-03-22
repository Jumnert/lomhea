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
                <div className="bg-accent/50 text-accent-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold tracking-tight uppercase">
                    Lomhea
                  </span>
                  <span className="truncate text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
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

"use client";

import {
  LayoutDashboard,
  MapPin,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  PlusCircle,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/admin" },
  { name: "Places", icon: MapPin, href: "/admin/places" },
  { name: "Users", icon: Users, href: "/admin/users" },
  { name: "Reviews", icon: MessageSquare, href: "/admin/reviews" },
  { name: "Requests", icon: PlusCircle, href: "/admin/requests" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 z-100 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl tracking-tight">Lomhea</span>
            )}
          </Link>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 rounded-xl px-3 group",
                  isActive
                    ? "bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon
                    size={20}
                    className={cn(
                      isActive
                        ? "text-primary"
                        : "text-zinc-400 group-hover:text-zinc-500",
                    )}
                  />
                  {isSidebarOpen && (
                    <span className="ml-3 font-semibold">{item.name}</span>
                  )}
                  {isActive && isSidebarOpen && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              </Button>
            );
          })}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          {isSidebarOpen ? (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-700">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {session?.user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold truncate">
                    {session?.user?.name}
                  </span>
                  <span className="text-xs text-zinc-500 truncate">Admin</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start h-10 rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900/30 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-12 rounded-xl text-red-500 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={20} />
          </Button>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative border bg-zinc-50 dark:bg-zinc-800/50"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <div className="h-8 w-px bg-zinc-200 dark:border-zinc-800 mx-2" />
            <span className="text-sm font-semibold">
              {pathname === "/admin"
                ? "Overview"
                : pathname
                    .split("/")
                    .pop()
                    ?.replace(/^\w/, (c) => c.toUpperCase())}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

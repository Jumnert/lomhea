"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <DropdownMenu onOpenChange={(open) => open && markAsRead()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-2xl w-10 h-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-md border border-white/20 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-900 transition-all"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-900" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[300px] sm:w-[360px] rounded-3xl p-2 shadow-2xl border-zinc-100 dark:border-zinc-800"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="font-bold text-base">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-black">
              {unreadCount} NEW
            </span>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
              <Bell size={24} className="mb-2 opacity-20" />
              <p className="text-xs font-medium italic">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 rounded-2xl transition-colors cursor-pointer",
                  !n.isRead && "bg-primary/5 dark:bg-primary/10",
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 line-clamp-2">
                  {n.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

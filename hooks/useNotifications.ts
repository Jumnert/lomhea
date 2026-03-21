import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "@/lib/pusher-client";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

export function useNotifications() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { trigger } = useWebHaptics();

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session,
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = pusherClient.subscribe(`notifications-${session.user.id}`);

    channel.bind("new-notification", (data: any) => {
      // Impact haptic on new notification
      trigger([{ duration: 40 }, { delay: 50, duration: 40, intensity: 1 }]);

      toast(data.title, {
        description: data.message,
      });

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      pusherClient.unsubscribe(`notifications-${session.user.id}`);
    };
  }, [session?.user?.id, queryClient, trigger]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id?: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return { notifications, unreadCount, markAsRead, isLoading };
}

"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  useEffect(() => {
    if ("serviceWorker" in navigator && session?.user) {
      registerServiceWorker();
    }
  }, [session]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered");

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) return;

        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        };

        subscription =
          await registration.pushManager.subscribe(subscribeOptions);
      }

      // Send to backend
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to register Service Worker:", error);
    }
  };

  return <>{children}</>;
}

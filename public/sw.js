self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "Lomhea Update",
    body: "You have a new notification!",
  };

  const options = {
    body: data.body,
    icon: "/logo.png", // Ensure you have a logo.png in public folder
    badge: "/badge.png", // Ensure you have a badge.png (white on transparent)
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

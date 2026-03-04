// // Empty service worker to silence 404 errors in development
// self.addEventListener("install", () => {
//   self.skipWaiting();
// });

// self.addEventListener("activate", () => {
//   self.registration
//     .unregister()
//     .then(() => self.clients.matchAll())
//     .then((clients) => {
//       clients.forEach((client) => client.navigate(client.url));
//     });
// });

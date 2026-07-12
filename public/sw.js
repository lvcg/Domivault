self.addEventListener("push", (event) => {
  let payload = {
    title: "DomiVault reminder",
    body: "A home maintenance reminder is due.",
    url: "/maintenance",
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      badge: "/icon.svg",
      icon: "/icon.svg",
      data: {
        url: payload.url || "/maintenance",
      },
      tag: payload.tag || "domivault-reminder",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/maintenance";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.includes(targetUrl));
      if (existingClient) return existingClient.focus();
      return self.clients.openWindow(targetUrl);
    }),
  );
});


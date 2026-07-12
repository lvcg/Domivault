"use client";

import { useCallback, useEffect, useState } from "react";

type PushStatus = "unsupported" | "idle" | "requesting" | "enabled" | "denied" | "error";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>("idle");
  const [message, setMessage] = useState("Enable browser push reminders for due maintenance tasks.");
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const isSupported = typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window
    && "Notification" in window;

  useEffect(() => {
    if (!isSupported) {
      setStatus("unsupported");
      setMessage("This browser does not support web push notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      setStatus("enabled");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      setMessage("Browser notification permission is blocked. Enable it in site settings to use push reminders.");
    }
  }, [isSupported]);

  const registerPushNotifications = useCallback(async () => {
    if (!isSupported) {
      setStatus("unsupported");
      setMessage("This browser does not support web push notifications.");
      return false;
    }

    if (!publicKey) {
      setStatus("error");
      setMessage("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY. Add VAPID keys before enabling push reminders.");
      return false;
    }

    setStatus("requesting");
    setMessage("Requesting browser notification permission...");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus(permission === "denied" ? "denied" : "idle");
      setMessage("Push notifications were not enabled.");
      return false;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const existingSubscription = await registration.pushManager.getSubscription();
    const subscription = existingSubscription || await registration.pushManager.subscribe({
      applicationServerKey: urlBase64ToUint8Array(publicKey),
      userVisibleOnly: true,
    });

    const response = await fetch("/api/notifications/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: "Could not save push subscription." }));
      setStatus("error");
      setMessage(payload.message || "Could not save push subscription.");
      return false;
    }

    setStatus("enabled");
    setMessage("Push reminders are enabled for this browser.");
    return true;
  }, [isSupported, publicKey]);

  const unregisterPushNotifications = useCallback(async () => {
    if (!isSupported) return false;
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
    await fetch("/api/notifications/register", { method: "DELETE" });
    setStatus("idle");
    setMessage("Push reminders are disabled for this browser.");
    return true;
  }, [isSupported]);

  return {
    isSupported,
    message,
    registerPushNotifications,
    status,
    unregisterPushNotifications,
  };
}

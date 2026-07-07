import { expect, test } from "@playwright/test";
import { resetLocalState } from "./helpers";

test.describe("Web push notifications", () => {
  test("registers a push subscription and does not show legacy reminder copy", async ({ page }) => {
    await resetLocalState(page);

    let registrationPayload: unknown = null;
    await page.route("**/api/notifications/register", async (route) => {
      registrationPayload = route.request().postDataJSON();
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify({ ok: true, savedAt: new Date().toISOString() }),
      });
    });

    await page.addInitScript(() => {
      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: {
          permission: "default",
          requestPermission: async () => "granted",
        },
      });

      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: {
          register: async () => ({
            pushManager: {
              getSubscription: async () => null,
              subscribe: async () => ({
                endpoint: "https://push.example.test/subscription-id",
                expirationTime: null,
                keys: {
                  auth: "test-auth",
                  p256dh: "test-p256dh",
                },
                toJSON() {
                  return {
                    endpoint: "https://push.example.test/subscription-id",
                    expirationTime: null,
                    keys: {
                      auth: "test-auth",
                      p256dh: "test-p256dh",
                    },
                  };
                },
              }),
            },
          }),
          getRegistration: async () => null,
        },
      });
    });

    await page.goto("/settings");
    await expect(page.getByText(/Prepared PUSH reminder/i)).toHaveCount(0);
    await expect(page.getByText(/Connect provider keys in Settings/i)).toHaveCount(0);

    await page.getByRole("button", { name: "Enable push" }).click();
    await expect(page.getByText("Push reminders are enabled for this browser.")).toBeVisible();

    expect(registrationPayload).toMatchObject({
      subscription: {
        endpoint: "https://push.example.test/subscription-id",
        keys: {
          auth: "test-auth",
          p256dh: "test-p256dh",
        },
      },
    });
  });
});


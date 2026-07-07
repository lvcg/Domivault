import { expect, test } from "@playwright/test";
import { cardByHeading, resetLocalState } from "./helpers";

test.describe("Persistent hard delete behavior", () => {
  test.beforeEach(async ({ page }) => {
    await resetLocalState(page);
  });

  test("keeps a deleted maintenance task removed after reload", async ({ page }) => {
    await page.goto("/maintenance");
    await expect(cardByHeading(page, "Clean gutters")).toBeVisible();

    await cardByHeading(page, "Clean gutters").getByRole("button", { name: "Delete" }).click();
    await expect(cardByHeading(page, "Clean gutters")).toHaveCount(0);

    await page.reload();
    await expect(cardByHeading(page, "Clean gutters")).toHaveCount(0);
  });

  test("keeps a deleted appliance removed after reload", async ({ page }) => {
    await page.goto("/appliances");
    await expect(cardByHeading(page, "Water Heater")).toBeVisible();

    await cardByHeading(page, "Water Heater").getByRole("button", { name: "Delete" }).click();
    await expect(cardByHeading(page, "Water Heater")).toHaveCount(0);

    await page.reload();
    await expect(cardByHeading(page, "Water Heater")).toHaveCount(0);
  });
});


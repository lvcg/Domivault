import { expect, test } from "@playwright/test";
import { activatePlusLocally, mockReportExport, resetLocalState } from "./helpers";

test.describe("DomiVault Plus gating", () => {
  test("keeps Plus settings disabled and blocks exports for free users", async ({ page }) => {
    await resetLocalState(page);
    await mockReportExport(page, false);

    await page.goto("/settings");
    await expect(page.getByText("DomiVault Free")).toBeVisible();
    await expect(page.getByLabel("Calendar sync (Plus)")).toBeDisabled();
    await expect(page.getByLabel("Receipt scan suggestions (Plus)")).toBeDisabled();

    await page.goto("/reports");
    await page.locator("article").filter({ hasText: "Home improvement expense report" }).getByRole("button", { name: "PDF" }).click();
    await expect(page.getByText("Upgrade to DomiVault Plus to export reports.")).toBeVisible();
  });

  test("unlocks Plus settings and downloads report exports for Plus users", async ({ page }) => {
    await resetLocalState(page);
    await activatePlusLocally(page);
    await mockReportExport(page, true);

    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "DomiVault Plus" })).toBeVisible();
    await expect(page.getByLabel("Calendar sync (Plus)")).toBeEnabled();
    await expect(page.getByLabel("Receipt scan suggestions (Plus)")).toBeEnabled();

    await page.goto("/reports");
    const reportCard = page.locator("article").filter({ hasText: "Home improvement expense report" });

    const csvDownload = page.waitForEvent("download");
    await reportCard.getByRole("button", { name: "CSV" }).click();
    await expect((await csvDownload).suggestedFilename()).toBe("domivault-report.csv");

    const pdfDownload = page.waitForEvent("download");
    await reportCard.getByRole("button", { name: "PDF" }).click();
    await expect((await pdfDownload).suggestedFilename()).toBe("domivault-report.pdf");
  });
});

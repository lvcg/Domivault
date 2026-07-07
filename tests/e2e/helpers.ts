import { expect, type Page } from "@playwright/test";

export async function resetLocalState(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

export async function activatePlusLocally(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("domivault-plus-entitlement-active", "true");
  });
}

export function dashboardMetric(page: Page, href: string, title: string) {
  return page.locator(`a[href="${href}"]`).filter({ hasText: title }).locator("h3");
}

export function cardByHeading(page: Page, heading: string) {
  return page.locator("article").filter({ hasText: heading });
}

export async function mockReportExport(page: Page, plus: boolean) {
  await page.route("**/api/reports/export", async (route) => {
    const requestBody = route.request().postDataJSON() as { format?: "csv" | "pdf"; report?: string } | null;

    if (!plus) {
      await route.fulfill({
        contentType: "application/json",
        status: 402,
        body: JSON.stringify({ message: "Upgrade to DomiVault Plus to export reports." }),
      });
      return;
    }

    const format = requestBody?.format || "csv";
    const contentType = format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8";
    const filename = format === "pdf" ? "domivault-report.pdf" : "domivault-report.csv";

    await route.fulfill({
      body: format === "pdf" ? "%PDF-1.4\n% DomiVault test PDF" : "Report,Status\nDomiVault,Ready\n",
      contentType,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
      status: 200,
    });
  });
}

export async function assertVisibleText(page: Page, text: string | RegExp) {
  await expect(page.getByText(text)).toBeVisible();
}

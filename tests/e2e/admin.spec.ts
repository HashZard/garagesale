import { expect, test } from "@playwright/test";

test("本地演示后台可以登录、搜索和查看活动", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "仅桌面项目运行一次");
  await page.goto("/admin");
  await page.waitForLoadState("networkidle");
  await page
    .getByLabel("Admin secret")
    .fill("garage-sale-local-admin-secret-change-me");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("heading", { name: "Listings admin" }),
  ).toBeVisible();
  await page.getByLabel("Search listings").fill("Fremantle");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText(/listing/).first()).toBeVisible();
  await page.getByRole("link", { name: "View and edit" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Edit listing" }),
  ).toBeVisible();
});

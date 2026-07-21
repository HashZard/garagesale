import { expect, test } from "@playwright/test";

test("演示模式完成发布、验证、修改和取消闭环", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "仅桌面项目运行一次");
  const uniqueTitle = `E2E moving sale ${Date.now()}`;
  await page.goto("/publish");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/^Title/).fill(uniqueTitle);
  await page
    .getByLabel(/Full street address/)
    .fill("10 Market Street, Fremantle WA 6160");
  await page.getByLabel("Email address").fill("e2e@example.test");
  await page.getByText("Furniture", { exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "Furniture" })).toBeChecked();
  await page.getByRole("button", { name: "Publish my garage sale" }).click();

  await expect(
    page.getByRole("heading", { name: "Check your inbox" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Confirm demo listing" }).click();
  await expect(page).toHaveURL(/\/manage\/[0-9a-f-]+\?verified=1/, {
    timeout: 20_000,
  });
  await expect(page.getByText("Your listing is live")).toBeVisible();

  await page.getByLabel("Title").fill(`${uniqueTitle} updated`);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Cancel listing" }).click();
  await expect(page.getByText("This listing is cancelled")).toBeVisible();
});

test("找回链接接口保持中性响应", async ({ request }) => {
  const response = await request.post("/api/recover", {
    data: { email: "unknown@example.test" },
  });
  expect(response.ok()).toBe(true);
  const result = (await response.json()) as { message: string };
  expect(result.message).toContain("If active listings match");
});

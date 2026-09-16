import { expect, test } from "@playwright/test";

test("发布页使用共享的外部服务配置", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "仅桌面项目运行一次");
  await page.goto("/publish");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", { name: "Publish your sale" }),
  ).toBeVisible();
  await expect(page.getByLabel("Bot protection challenge")).toBeVisible();
});

test("找回链接接口保持中性响应", async ({ request }) => {
  const response = await request.post("/api/recover", {
    data: {
      email: "unknown@example.test",
    },
  });
  expect(response.ok()).toBe(true);
  const result = (await response.json()) as { message: string };
  expect(result.message).toContain("If active listings match");
});

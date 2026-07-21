import { expect, test } from "@playwright/test";

test("首页、搜索、详情和SEO页面可访问", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Find garage sales near you this weekend",
    }),
  ).toBeVisible();
  await expect(page.getByText("Demo listings")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();

  await page.goto("/?q=Fremantle");
  await expect(page.getByText(/Near Fremantle/)).toBeVisible();
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: "List" }).click();
  }
  const firstListing = page
    .locator('[data-slot="card"] a[href^="/sale/"]')
    .first();
  await expect(firstListing).toBeVisible();
  await firstListing.click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Fremantle WA 61/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Directions/i })).toBeVisible();

  await page.goto("/?q=6160");
  await expect(page.getByText(/Near Fremantle, WA 6160/)).toBeVisible();

  await page.goto("/sale/00000000-0000-4000-8000-000000000005");
  await expect(
    page.getByRole("link", { name: "View original listing" }),
  ).toBeVisible();

  await page.goto("/garage-sales/wa/fremantle-wa-6160");
  await expect(
    page.getByRole("heading", { name: "Garage sales near Fremantle" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Nearby areas" }),
  ).toBeVisible();

  await page.goto("/garage-sales/qld");
  await expect(page.getByText("No upcoming sales listed yet.")).toBeVisible();
});

test("移动端可切换地图和列表且没有横向溢出", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "仅移动项目运行");
  await page.goto("/");
  await page.getByRole("button", { name: "List" }).click();
  await expect(
    page.locator('[data-slot="card"] a[href^="/sale/"]').first(),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("允许定位时使用浏览器坐标搜索", async ({ context, page }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: -32.0569, longitude: 115.7478 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page).toHaveURL(/lat=-32\.0569/);
  await expect(page).toHaveURL(/lng=115\.7478/);
});

test("robots和sitemap包含预期规则", async ({ request }) => {
  const home = await request.get("/");
  await expect(home.text()).resolves.toContain(
    "Find garage sales near you this weekend",
  );
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  await expect(robots.text()).resolves.toContain("Disallow: /manage");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  await expect(sitemap.text()).resolves.toContain("/garage-sales/wa");
});

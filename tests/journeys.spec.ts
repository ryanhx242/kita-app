import { test, expect } from "@playwright/test";
test("learn, rehearse and have a conversation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Lessons", exact: true }).click();
  await page.getByRole("link", { name: /Music & songs/ }).click();
  await page.getByRole("link", { name: /Learn vocabulary/ }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next word" }).click();
  await page.getByRole("button", { name: "Try a little practice" }).click();
  for (const [i, answer] of [
    "Song",
    "Listen",
    "Like / love",
    "Sing",
  ].entries()) {
    await page.getByRole("button", { name: answer, exact: true }).click();
    await page
      .getByRole("button", {
        name: i === 3 ? "Finish practice" : "Next question",
      })
      .click();
  }
  await expect(page.getByText("Look at you grow.")).toBeVisible();
  await page.getByRole("link", { name: "Try them in a conversation" }).click();
  await page.getByLabel("Your message").fill("Tell me about music");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/We used to gather/)).toBeVisible();
  await page
    .getByRole("link", { name: "Ready for a real conversation" })
    .click();
  await expect(page.getByText("LIVE CONVERSATION")).toBeVisible();
  await page.getByRole("button", { name: "Favourite prompt" }).click();
  await page.getByRole("button", { name: "Next question" }).click();
  await page.reload();
  expect(errors).toEqual([]);
});
test("photo conversation, story persistence, editing and deletion", async ({
  page,
}) => {
  await page.goto("/album");
  await page.getByRole("link", { name: /Grandpa’s old radio/ }).click();
  await page.getByRole("link", { name: /What songs do you like/ }).click();
  await page
    .getByRole("link", { name: "Save a memory, if you’d like" })
    .click();
  await page.getByLabel("Story title").fill("Radio Sundays");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Grandpa listened with his sister.");
  await page.getByRole("button", { name: "Save story privately" }).click();
  await expect(
    page.getByRole("heading", { name: "Radio Sundays" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Radio Sundays" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Edit story" }).click();
  await page.getByLabel("Story title").fill("Sunday songs");
  await page.getByRole("button", { name: "Save story privately" }).click();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete story", exact: true }).click();
  await expect(page.getByText("Room for your first story")).toBeVisible();
});
test("upload survives reload and metadata can be edited", async ({ page }) => {
  await page.goto("/photo/new");
  await page.getByLabel("Photograph", { exact: true }).setInputFiles({
    name: "memory.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jJ1kAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByLabel("Photo title").fill("Our memory");
  await page.getByLabel(/I have permission/).check();
  await page.getByRole("button", { name: "Save privately" }).click();
  await expect(page.getByRole("heading", { name: "Our memory" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("img", { name: "Our memory" })).toBeVisible();
  await page.getByRole("link", { name: "Edit details" }).click();
  await page.getByLabel("Photo title").fill("Renamed memory");
  await page.getByLabel(/I have permission/).check();
  await page.getByRole("button", { name: "Save privately" }).click();
  await expect(
    page.getByRole("heading", { name: "Renamed memory" }),
  ).toBeVisible();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/album/);
});
test("simulated review withholds then releases corrected synthetic output", async ({
  page,
}) => {
  await page.goto("/internal/review");
  await page
    .getByRole("button", { name: "Create synthetic review request" })
    .click();
  await expect(page.getByText(/Output withheld/)).toBeVisible();
  await page
    .getByLabel("Human correction or replacement")
    .fill("Checked synthetic response");
  await page.getByRole("button", { name: "Approve / replace" }).click();
  await expect(
    page.getByText("Released (simulation): Checked synthetic response"),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Released (simulation): Checked synthetic response"),
  ).toBeVisible();
});
for (const width of [320, 375, 390])
  test(`mobile layout ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "/",
      "/lessons",
      "/album",
      "/settings",
      "/topic/music/talk",
      "/topic/food/vocabulary",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await page
          .locator(".app")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    }
    await page.goto("/");
    await page.screenshot({
      path: `work/screenshots/home-${width}.png`,
      fullPage: true,
    });
  });

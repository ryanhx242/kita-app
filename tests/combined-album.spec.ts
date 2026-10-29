import { test, expect } from "@playwright/test";
async function save(page: import("@playwright/test").Page, linked = false) {
  await page.goto(linked ? "/story/new?photo=radio" : "/story/new");
  await page.getByLabel("Story title").fill("Radio memory");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Grandpa listened to songs on the radio.");
  await page.getByLabel("Storyteller", { exact: true }).fill("Grandpa");
  await page.getByRole("button", { name: "Save story privately" }).click();
  await expect(
    page.getByRole("heading", { name: "Radio memory", exact: true }),
  ).toBeVisible();
}
test("album keeps related photos and stories together and shows standalone memories", async ({
  page,
}) => {
  await save(page, true);
  await page.goto("/album");
  const group = page.getByRole("article", {
    name: "Grandpa’s old radio",
    exact: true,
  });
  await expect(group.getByText("Radio memory", { exact: true })).toBeVisible();
  await expect(group.getByRole("link", { name: "Replay story" })).toBeVisible();
  await expect(
    group.getByRole("link", { name: "Practise story words" }),
  ).toBeVisible();
  await group
    .getByRole("link", { name: /Grandpa’s old radio Grandpa/ })
    .click();
  await expect(
    page
      .getByRole("region", { name: "Stories with this photo" })
      .getByText("Radio memory", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Radio memory Told by/ }).click();
  await expect(
    page.getByRole("link", { name: /Part of Grandpa’s old radio/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Go back" })).toHaveAttribute(
    "href",
    "/photo/radio",
  );
  await page.goto("/stories?photo=radio");
  await expect(page).toHaveURL("/album?photo=radio");
  await expect(page.getByRole("article")).toHaveCount(1);
});
test("a standalone memory can be attached and detached without extra required fields", async ({
  page,
}) => {
  await save(page);
  await page.goto("/album");
  await expect(
    page
      .locator(".standalone-stories")
      .getByText("Radio memory", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Radio memory Told by/ }).click();
  await page.getByRole("link", { name: "Edit story", exact: true }).click();
  await page
    .getByText("Photo in this memory (optional)", { exact: true })
    .click();
  await page.getByLabel("Attach to a photo").selectOption("radio");
  await page.getByRole("button", { name: "Save story privately" }).click();
  await page.goto("/album");
  await expect(
    page
      .getByRole("article", { name: "Grandpa’s old radio", exact: true })
      .getByText("Radio memory", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".standalone-stories")
      .getByText("Radio memory", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: /Radio memory Told by/ }).click();
  await page.getByRole("link", { name: "Edit story", exact: true }).click();
  await page
    .getByText("Photo in this memory (optional)", { exact: true })
    .click();
  await page.getByLabel("Attach to a photo").selectOption("");
  await page.getByRole("button", { name: "Save story privately" }).click();
  await page.goto("/album");
  await expect(
    page
      .locator(".standalone-stories")
      .getByText("Radio memory", { exact: true }),
  ).toBeVisible();
});
test("deleting a photo preserves its stories and unified filters search their descriptions", async ({
  page,
}) => {
  await save(page, true);
  await page.goto("/photo/radio");
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL("/album");
  await expect(
    page
      .locator(".standalone-stories")
      .getByText("Radio memory", { exact: true }),
  ).toBeVisible();
  await page.getByText("Find a memory", { exact: true }).click();
  await page.getByLabel("Search memories").fill("listened");
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /Radio memory Told by/ }),
  ).toBeVisible();
  await page.getByLabel("Search memories").fill("not a matching phrase");
  await expect(page.getByRole("status")).toContainText("No memories match");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("article")).toHaveCount(5);
});

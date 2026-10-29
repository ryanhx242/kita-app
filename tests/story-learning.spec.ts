import { test, expect } from "@playwright/test";
async function getXP(page: import("@playwright/test").Page) {
  return page.evaluate(
    () => JSON.parse(localStorage.getItem("kita-progress") || "{}").xp || 0,
  );
}
async function quiz(page: import("@playwright/test").Page, topic = "music") {
  await page.goto(`/topic/${topic}/vocabulary`);
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next word", exact: true }).click();
  await page.getByRole("button", { name: "Try a little practice" }).click();
}
async function saveMemory(
  page: import("@playwright/test").Page,
  title = "Sunday radio",
) {
  await page.goto("/story/new");
  await page.getByLabel("Story title").fill(title);
  await page
    .getByLabel("Description", { exact: true })
    .fill(
      "Grandpa listened to music on the radio and sang songs with his friends.",
    );
  await page.getByLabel("Storyteller", { exact: true }).fill("Grandpa Tan");
  await page.getByRole("button", { name: "Save story privately" }).click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
}
test("conversation completion returns Home with in-app notification and separate session XP", async ({
  page,
}) => {
  let dialogs = 0;
  page.on("dialog", (d) => {
    dialogs++;
    d.dismiss();
  });
  await page.goto("/topic/music/talk?photo=radio");
  await page.getByRole("button", { name: "We had a conversation" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("status")).toContainText(
    "A little closer. Conversation saved · +15 XP.",
  );
  expect(await getXP(page)).toBe(15);
  await expect(
    page.getByRole("link", { name: "Save a memory (optional)" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(page.getByText("A little closer.")).not.toBeVisible();
  await page.goto("/topic/music/talk");
  await page.getByRole("button", { name: "We had a conversation" }).click();
  await expect(page).toHaveURL("/");
  expect(await getXP(page)).toBe(30);
  expect(dialogs).toBe(0);
});
test("XP is earned per answer and persists without duplicate rewards", async ({
  page,
}) => {
  await quiz(page);
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  expect(await getXP(page)).toBe(0);
  await page.getByRole("button", { name: "Song", exact: true }).click();
  await expect.poll(() => getXP(page)).toBe(5);
  await page.getByRole("button", { name: "Next question" }).click();
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  await expect.poll(() => getXP(page)).toBe(10);
  await quiz(page);
  await page.getByRole("button", { name: "Song", exact: true }).click();
  expect(await getXP(page)).toBe(10);
  await page.getByRole("button", { name: "Next question" }).click();
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  expect(await getXP(page)).toBe(10);
  await page.getByRole("button", { name: "Next question" }).click();
  await page.getByRole("button", { name: "Like / love", exact: true }).click();
  await expect.poll(() => getXP(page)).toBe(15);
  await page.getByRole("button", { name: "Next question" }).click();
  await page.getByRole("button", { name: "Sing", exact: true }).click();
  await page.getByRole("button", { name: "Finish practice" }).click();
  await expect.poll(() => getXP(page)).toBe(20);
  await expect(page.getByText("+10 XP this practice")).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByText("1 of 3 activities")).toBeVisible();
});
test("bot replies are bilingual and hints, repetitions and withheld messages earn no XP", async ({
  page,
}) => {
  await page.goto("/topic/music/practice");
  async function send(text: string) {
    await page.getByLabel("Your message").fill(text);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator(".bubble.user").last()).toHaveText(text);
  }
  await send("Tell me about music");
  await expect(page.locator(".bot-hokkien").first()).toContainText("我愛聽歌");
  await expect(page.locator(".bot-hokkien").first()).toContainText(
    "Wa ai tiaⁿ kua.",
  );
  await expect(page.locator(".bot-hokkien").first()).toContainText(
    "I like listening to songs.",
  );
  await expect.poll(() => getXP(page)).toBe(5);
  await send("Tell me about music");
  expect(await getXP(page)).toBe(5);
  await send("help");
  expect(await getXP(page)).toBe(5);
  await send("inheritance");
  expect(await getXP(page)).toBe(5);
  await expect(page.locator(".bubble.assistant").last()).not.toContainText(
    "Draft translation",
  );
  await send("Who listened with you?");
  await expect.poll(() => getXP(page)).toBe(10);
  await send("Can we listen together?");
  await expect.poll(() => getXP(page)).toBe(15);
  await page.reload();
  await send("A new reply");
  expect(await getXP(page)).toBe(15);
});
test("three-field stories create private custom lessons and can be read aloud", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await saveMemory(page);
  expect(await getXP(page)).toBe(0);
  await expect(
    page.getByRole("heading", { name: "Replay this memory" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Edit story", exact: true }).click();
  await expect(
    page.locator("input:not([type=file]):not([type=checkbox]),textarea"),
  ).toHaveCount(3);
  await expect(page.getByLabel("Storyteller", { exact: true })).toHaveValue(
    "Grandpa Tan",
  );
  await page.getByRole("button", { name: "Save story privately" }).click();
  await page
    .getByRole("link", { name: "Practise words from this story" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Words from Sunday radio" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Learn vocabulary/ }).click();
  await expect(page.locator(".wordcard")).toContainText(/song|listen/i);
  await page.reload();
  await expect(page.locator(".wordcard")).toBeVisible();
  await page.goto("/lessons");
  await expect(
    page.getByRole("link", { name: /Sunday radio Inspired by/ }),
  ).toBeVisible();
  expect(await getXP(page)).toBe(0);
  expect(errors).toEqual([]);
});
function wav() {
  const rate = 8000,
    samples = 4000,
    b = Buffer.alloc(44 + samples * 2);
  b.write("RIFF");
  b.writeUInt32LE(b.length - 8, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(samples * 2, 40);
  return b;
}
test("saved original recordings replay after reload and old story notes survive editing", async ({
  page,
}) => {
  await page.goto("/story/new");
  await page.getByLabel("Story title").fill("A recorded memory");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Our family dinner.");
  await page.getByLabel("Storyteller", { exact: true }).fill("Grandma");
  await page.getByText("Add a recording (optional)").click();
  await expect(
    page.getByLabel("Or attach an existing recording"),
  ).toBeDisabled();
  await page.getByLabel(/Everyone involved agrees/).check();
  await page
    .getByLabel("Or attach an existing recording")
    .setInputFiles({
      name: "memory.wav",
      mimeType: "audio/wav",
      buffer: wav(),
    });
  await page.getByRole("button", { name: "Save story privately" }).click();
  await expect(
    page.getByRole("heading", { name: "A recorded memory", exact: true }),
  ).toBeVisible();
  await page.reload();
  const audio = page.getByLabel("Original story recording");
  await expect(audio).toBeVisible();
  await expect
    .poll(() => audio.evaluate((a: HTMLAudioElement) => a.readyState))
    .toBeGreaterThanOrEqual(2);
  await audio.evaluate((a: HTMLAudioElement) => a.play());
  await expect
    .poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime))
    .toBeGreaterThan(0);
  await audio.evaluate((a: HTMLAudioElement) => {
    a.pause();
    a.currentTime = 0;
  });
  expect(await getXP(page)).toBe(0);
  await page.getByRole("link", { name: "Edit story", exact: true }).click();
  await page
    .getByLabel("Description", { exact: true })
    .fill("Grandma cooked rice.");
  await page.getByRole("button", { name: "Save story privately" }).click();
  await expect(page.getByLabel("Original story recording")).toBeVisible();
  await page
    .getByRole("link", { name: "Practise words from this story" })
    .click();
  await expect(page.getByText("Words from A recorded memory")).toBeVisible();
});
test("legacy stored notes and XP remain intact after updating", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    localStorage.setItem(
      "kita-progress",
      JSON.stringify({
        xp: 30,
        completed: ["music-vocabulary", "music-practice"],
        days: [],
        favourites: [],
      }),
    );
    const r = indexedDB.open("kita-private");
    const db = await new Promise<IDBDatabase>(
      (resolve) => (r.onsuccess = () => resolve(r.result)),
    );
    const tx = db.transaction("stories", "readwrite");
    tx.objectStore("stories").put({
      id: "legacy",
      photoId: "radio",
      title: "Old memory",
      text: "Songs at home",
      people: "Grandpa",
      topic: "music",
      summary: "Saved summary",
      transcript: "Original transcript",
    });
    await new Promise<void>((resolve) => (tx.oncomplete = () => resolve()));
    db.close();
  });
  await page.goto("/story/legacy/edit");
  await expect(page.getByLabel("Story title")).toHaveValue("Old memory");
  await page.getByLabel("Story title").fill("Kept memory");
  await page.getByRole("button", { name: "Save story privately" }).click();
  await page.getByText("Earlier saved notes").click();
  await expect(page.getByText("Saved summary", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Original transcript", { exact: true }),
  ).toBeVisible();
  expect(await getXP(page)).toBe(30);
  await quiz(page);
  await page.getByRole("button", { name: "Song", exact: true }).click();
  expect(await getXP(page)).toBe(30);
});

test('device read-aloud can start and stop without changing XP',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){document.documentElement.dataset.speechStopped='yes'},speak(u:SpeechSynthesisUtterance){document.documentElement.dataset.spokenText=u.text}}})});
 await saveMemory(page,'Read-aloud memory');await page.getByRole('button',{name:'Read description aloud',exact:true}).click();await expect(page.getByRole('button',{name:'Stop reading',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.dataset.spokenText)).toContain('Grandpa listened');await page.getByRole('button',{name:'Stop reading',exact:true}).click();await expect(page.getByRole('button',{name:'Read description aloud',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.dataset.speechStopped)).toBe('yes');expect(await getXP(page)).toBe(0);
});
test('stories with no matching words offer an honest topic choice that survives activity navigation',async({page})=>{await page.goto('/story/new');await page.getByLabel('Story title').fill('Clouds');await page.getByLabel('Description',{exact:true}).fill('Clouds drifted across the sky.');await page.getByLabel('Storyteller',{exact:true}).fill('Auntie');await page.getByRole('button',{name:'Save story privately'}).click();await page.getByRole('link',{name:'Practise words from this story'}).click();await expect(page.getByText('A starting point for this story')).toBeVisible();await page.getByRole('button',{name:/Music & Favourite Songs/}).click();await page.getByRole('link',{name:/Learn vocabulary/}).click();await expect(page.locator('.wordcard')).toContainText('Song');await page.reload();await expect(page.locator('.wordcard')).toContainText('Song');expect(await getXP(page)).toBe(0)});

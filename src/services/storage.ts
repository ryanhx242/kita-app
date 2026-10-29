import { openDB } from "idb";
import { samplePhotos, type Photo, type Story } from "../data";
const db = openDB("kita-private", 1, {
  upgrade(db) {
    db.createObjectStore("photos", { keyPath: "id" });
    db.createObjectStore("stories", { keyPath: "id" });
    db.createObjectStore("meta");
  },
});
export const storage = {
  async init() {
    const d = await db;
    if (!(await d.get("meta", "seeded"))) {
      const tx = d.transaction(["photos", "meta"], "readwrite");
      for (const p of samplePhotos) await tx.objectStore("photos").put(p);
      await tx.objectStore("meta").put(true, "seeded");
      await tx.done;
    }
  },
  async photos(): Promise<Photo[]> {
    return (await db).getAll("photos");
  },
  async stories(): Promise<Story[]> {
    return (await db).getAll("stories");
  },
  async photo(p: Photo) {
    return (await db).put("photos", p);
  },
  async story(s: Story) {
    return (await db).put("stories", s);
  },
  async deletePhoto(id: string) {
    const d = await db;
    const tx = d.transaction(["photos", "stories"], "readwrite");
    await tx.objectStore("photos").delete(id);
    for (const s of await tx.objectStore("stories").getAll())
      if (s.photoId === id)
        await tx.objectStore("stories").put({ ...s, photoId: "" });
    await tx.done;
  },
  async deleteStory(id: string) {
    return (await db).delete("stories", id);
  },
  async clear() {
    const d = await db;
    for (const table of ["photos", "stories", "meta"]) await d.clear(table);
  },
};

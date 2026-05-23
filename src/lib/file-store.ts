import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), ".data", "vizbiz");

export async function saveJson<T extends { id: string }>(collection: string, record: T): Promise<T> {
  return saveJsonWithKey(collection, record.id, record);
}

export async function saveJsonWithKey<T>(collection: string, key: string, record: T): Promise<T> {
  const dir = path.join(dataDir, collection);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${safeFileKey(key)}.json`), JSON.stringify(record, null, 2));
  return record;
}

export async function readJson<T>(collection: string, id: string): Promise<T | null> {
  try {
    const content = await readFile(path.join(dataDir, collection, `${safeFileKey(id)}.json`), "utf8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function listJson<T>(collection: string): Promise<T[]> {
  try {
    const dir = path.join(dataDir, collection);
    const files = (await readdir(dir)).filter((file) => file.endsWith(".json"));
    const records = await Promise.all(
      files.map(async (file) => {
        const content = await readFile(path.join(dir, file), "utf8");
        return JSON.parse(content) as T;
      }),
    );
    return records;
  } catch {
    return [];
  }
}

function safeFileKey(key: string) {
  return key.replace(/[^a-zA-Z0-9_-]/g, "-");
}

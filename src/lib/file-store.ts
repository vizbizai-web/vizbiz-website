import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), ".data", "vizbiz");

export async function saveJson<T extends { id: string }>(collection: string, record: T): Promise<T> {
  const dir = path.join(dataDir, collection);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${record.id}.json`), JSON.stringify(record, null, 2));
  return record;
}

export async function readJson<T>(collection: string, id: string): Promise<T | null> {
  try {
    const content = await readFile(path.join(dataDir, collection, `${id}.json`), "utf8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

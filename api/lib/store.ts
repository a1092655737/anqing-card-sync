import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("./data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFile(key: string): string {
  return path.join(DATA_DIR, `${key}.json`);
}

export function load<T>(key: string, defaultValue: T): T {
  ensureDir();
  const file = getFile(key);
  if (!fs.existsSync(file)) return defaultValue;
  try {
    const data = fs.readFileSync(file, "utf-8");
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

export function save<T>(key: string, data: T): void {
  ensureDir();
  const file = getFile(key);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

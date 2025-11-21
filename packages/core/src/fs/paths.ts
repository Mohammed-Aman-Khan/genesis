import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export async function ensureDir(dir: string): Promise<void> {
  await fs.promises.mkdir(dir, { recursive: true });
}

export function getGenesisHome(): string {
  const home = os.homedir();
  const dir = path.join(home, ".genesis");
  return dir;
}

export async function ensureGenesisHome(): Promise<string> {
  const dir = getGenesisHome();
  await ensureDir(dir);
  return dir;
}

export function joinPath(...segments: string[]): string {
  return path.join(...segments);
}


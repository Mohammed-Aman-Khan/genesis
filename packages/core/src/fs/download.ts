import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import { ensureDir } from "./paths.js";

export interface DownloadOptions {
  headers?: Record<string, string>;
}

export async function downloadFile(
  url: string,
  destination: string,
  options?: DownloadOptions
): Promise<string> {
  const dir = path.dirname(destination);
  await ensureDir(dir);
  const client = url.startsWith("https") ? https : http;
  await new Promise<void>((resolve, reject) => {
    const request = client.get(
      url,
      { headers: options?.headers },
      (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(
            new Error(`Request failed with status ${response.statusCode}`)
          );
          return;
        }
        const file = fs.createWriteStream(destination);
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
        file.on("error", (error) => {
          reject(error);
        });
      }
    );
    request.on("error", (error) => {
      reject(error);
    });
  });
  return destination;
}

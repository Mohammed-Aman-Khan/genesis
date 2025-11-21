export type Platform = "macos" | "windows" | "linux";

export function getPlatform(): Platform {
  const value = process.platform;
  if (value === "darwin") {
    return "macos";
  }
  if (value === "win32") {
    return "windows";
  }
  return "linux";
}


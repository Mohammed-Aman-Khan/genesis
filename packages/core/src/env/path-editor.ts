import path from "node:path";

export interface PathEditOptions {
  prepend?: string[];
  append?: string[];
}

export function editPath(
  current: string | undefined,
  options: PathEditOptions
): string {
  const delimiter = path.delimiter;
  const parts = current ? current.split(delimiter) : [];
  const set = new Set(parts);
  const result: string[] = [];
  if (options.prepend) {
    for (const value of options.prepend) {
      if (!set.has(value)) {
        result.push(value);
      }
    }
  }
  for (const value of parts) {
    if (!result.includes(value)) {
      result.push(value);
    }
  }
  if (options.append) {
    for (const value of options.append) {
      if (!result.includes(value)) {
        result.push(value);
      }
    }
  }
  return result.join(delimiter);
}

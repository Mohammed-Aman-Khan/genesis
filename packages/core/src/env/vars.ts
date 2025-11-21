export type EnvPatch = Record<string, string>;

export function applyEnvPatch(patch: EnvPatch): void {
  for (const [key, value] of Object.entries(patch)) {
    process.env[key] = value;
  }
}


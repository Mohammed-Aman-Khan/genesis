export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LoggerOptions {
  level?: LogLevel;
  useColors?: boolean;
  prefix?: string;
}

function supportsColor(): boolean {
  if (process.env.NO_COLOR) {
    return false;
  }
  return process.stdout.isTTY === true;
}

function colorize(level: LogLevel, text: string, enabled: boolean): string {
  if (!enabled) {
    return text;
  }
  if (level === "debug") {
    return `\u001b[90m${text}\u001b[0m`;
  }
  if (level === "info") {
    return `\u001b[36m${text}\u001b[0m`;
  }
  if (level === "warn") {
    return `\u001b[33m${text}\u001b[0m`;
  }
  return `\u001b[31m${text}\u001b[0m`;
}

export class Logger {
  private level: LogLevel;
  private useColors: boolean;
  private prefix: string | undefined;

  constructor(options?: LoggerOptions) {
    this.level = options?.level ?? "info";
    this.useColors = options?.useColors ?? supportsColor();
    this.prefix = options?.prefix;
  }

  private format(level: LogLevel, message: string): string {
    const label = level.toUpperCase();
    const colored = colorize(level, label, this.useColors);
    const prefix = this.prefix ? `${this.prefix} ` : "";
    return `${prefix}${colored} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.level === "debug") {
      return true;
    }
    if (this.level === "info") {
      return level !== "debug";
    }
    if (this.level === "warn") {
      return level === "warn" || level === "error";
    }
    return level === "error";
  }

  debug(message: string): void {
    if (this.shouldLog("debug")) {
      console.debug(this.format("debug", message));
    }
  }

  info(message: string): void {
    if (this.shouldLog("info")) {
      console.log(this.format("info", message));
    }
  }

  warn(message: string): void {
    if (this.shouldLog("warn")) {
      console.warn(this.format("warn", message));
    }
  }

  error(message: string): void {
    if (this.shouldLog("error")) {
      console.error(this.format("error", message));
    }
  }
}

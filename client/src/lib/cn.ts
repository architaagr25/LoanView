/**
 * Joins class names, dropping anything falsy.
 *
 * Small enough to write rather than take a dependency for, and it keeps
 * conditional classes readable: cn("base", isActive && "active").
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

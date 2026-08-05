import { ApiError } from "./ApiError";

/**
 * Reads a single value from the request path.
 *
 * Express types a route parameter as string | string[], because a pattern can
 * capture repeated segments. The routes here never do, but the type is honest
 * about what is possible, so it is narrowed once here rather than cast away at
 * every use site.
 */
export function routeParam(value: string | string[] | undefined, name: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  throw ApiError.badRequest(`Missing or invalid "${name}" in the request path`);
}

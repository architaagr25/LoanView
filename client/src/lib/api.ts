import { readToken } from "./session";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/** One field-level problem reported by the server's validation. */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * An unsuccessful response, carrying enough detail for the interface to react
 * to the kind of failure rather than only displaying a message.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldError[];
  /** Free-form detail — the eligibility rules on a 422, for example. */
  readonly details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.fieldErrors = Array.isArray(details) ? (details as FieldError[]) : [];
  }

  /** No token, or one the server rejected. */
  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  /** Authenticated, but this role may not do it. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** Understood, but refused by business rules — eligibility, transitions. */
  get isPolicyRejection(): boolean {
    return this.status === 422;
  }
}

interface Envelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Serialised as JSON. */
  body?: unknown;
  /** Sent as multipart instead; the browser sets its own content type. */
  form?: FormData;
  signal?: AbortSignal;
}

function buildHeaders(hasJsonBody: boolean): HeadersInit {
  const headers: Record<string, string> = {};

  if (hasJsonBody) {
    headers["Content-Type"] = "application/json";
  }

  const token = readToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, form, signal } = options;

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: buildHeaders(body !== undefined),
      // Content-Type is deliberately not set for FormData: the browser must
      // generate it itself, because it has to include the multipart boundary.
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    // fetch only rejects when the request never completed — the server is
    // unreachable, asleep, or the network dropped. Worth saying so plainly,
    // because free hosting suspends an idle service and the first request
    // after that can take the better part of a minute.
    throw new ApiError(0, "Could not reach the server. It may be starting up — try again shortly.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? `Request failed with status ${response.status}`,
      payload?.errors,
    );
  }

  return payload?.data as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: "GET", signal }),

  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),

  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),

  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", form }),

  /**
   * Fetches a file as a blob.
   *
   * Needed because an <img> or <iframe> src cannot carry an Authorization
   * header, and these documents are access-controlled. The bytes are fetched
   * here and handed to an object URL instead.
   */
  async blob(path: string): Promise<Blob> {
    const response = await fetch(`${BASE_URL}${path}`, { headers: buildHeaders(false) });

    if (!response.ok) {
      throw new ApiError(response.status, "Could not load the document");
    }

    return response.blob();
  },
};

/** Used by the health ping that wakes a suspended backend. */
export const apiBaseUrl = BASE_URL;

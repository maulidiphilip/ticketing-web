import "server-only";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type Options = {
  method?: string;
  body?: unknown;
  token?: string;
};

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, token }: Options = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      503,
      "Cannot reach the ticketing server. Is it running?",
    );
  }

  if (!res.ok) {
    let detail = res.statusText || `Request failed (${res.status})`;
    let fieldErrors: Record<string, string> = {};
    try {
      const problem = await res.json();
      detail = problem.detail ?? detail;
      fieldErrors = problem.errors ?? {};
    } catch {
      // 401 and 403 come back with an empty body
    }
    throw new ApiError(res.status, detail, fieldErrors);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
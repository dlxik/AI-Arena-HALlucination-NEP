import type { ApiFailure, ApiSuccess } from "@/types/api";

export function ok<T>(data: T, init?: ResponseInit): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return Response.json(body, { status: 200, ...init });
}

export function fail(
  code: string,
  message: string,
  status = 400,
): Response {
  const body: ApiFailure = { success: false, error: { code, message } };
  return Response.json(body, { status });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

import { env } from "../config/env";
import { getAuthToken } from "../store/auth.store";

export async function httpClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  console.log("env.apiBaseUrl", env.apiBaseUrl);
  const token = getAuthToken();
  const isFormData = init?.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...init?.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
      errors?: Array<{ message: string }>;
    } | null;
    const validationMessage = errorPayload?.errors
      ?.map((error) => error.message)
      .join(". ");
    throw new Error(
      validationMessage ||
        errorPayload?.message ||
        errorPayload?.error ||
        `Request failed: ${response.status}`,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

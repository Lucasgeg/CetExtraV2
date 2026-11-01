/**
 * Fetcher partagé du front pour les routes `app/api/**`.
 *
 * - lève une `HttpError` dès que `response.ok` est faux (un 403/404 ne
 *   devient plus jamais `data`), avec le `message` ou `error` du corps JSON ;
 * - accepte un `signal` pour l'annulation (TanStack Query le fournit au
 *   `queryFn`) ;
 * - `json` sérialise le corps et pose l'en-tête `Content-Type`.
 *
 * Ne pas confondre avec `ApiError` (`types/ApiError.ts`), utilisée côté
 * serveur dans les route handlers.
 */
export class HttpError extends Error {
  readonly status: number;
  /** Corps de la réponse (JSON décodé, texte brut ou `undefined`). */
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const isHttpError = (error: unknown): error is HttpError =>
  error instanceof HttpError;

/** Vrai pour une ressource absente ou appartenant à quelqu'un d'autre. */
export const isNotFoundOrForbidden = (error: unknown): boolean =>
  isHttpError(error) && (error.status === 403 || error.status === 404);

type ApiFetchInit = Omit<RequestInit, "body"> & {
  body?: RequestInit["body"];
  /** Corps sérialisé en JSON (prioritaire sur `body`). */
  json?: unknown;
};

const readBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const messageFromBody = (body: unknown): string | undefined => {
  if (body && typeof body === "object") {
    const { message, error } = body as { message?: unknown; error?: unknown };
    if (typeof message === "string" && message) return message;
    if (typeof error === "string" && error) return error;
  }
  return undefined;
};

export async function apiFetch<T>(
  input: string,
  { json, headers, ...init }: ApiFetchInit = {}
): Promise<T> {
  const finalHeaders = new Headers(headers);
  if (json !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : init.body
  });
  const body = await readBody(response);

  if (!response.ok) {
    throw new HttpError(
      response.status,
      messageFromBody(body) ??
        (response.statusText || `Erreur HTTP ${response.status}`),
      body
    );
  }

  return body as T;
}

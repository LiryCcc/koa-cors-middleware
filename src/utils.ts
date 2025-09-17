interface HttpError extends Error {
  headers?: Record<string, string>;
}

export type { HttpError };

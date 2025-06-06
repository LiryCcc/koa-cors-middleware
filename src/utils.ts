class WrappedPromise<T> implements PromiseLike<T> {
  /**
   * The internally held Promise instance.
   */
  private internalPromise: Promise<T>;

  constructor(executor: (resolve: (value: T) => void, reject: (reason?: T) => void) => void) {
    this.internalPromise = new Promise<T>(executor);
  }

  then<TResult1, TResult2>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.internalPromise.then(onfulfilled, onrejected); // This matches the PromiseLike signature
  }
}

interface HttpError extends Error {
  headers?: Record<string, string>;
}

export { WrappedPromise };
export type { HttpError };

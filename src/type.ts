import * as Koa from 'koa';
import { Context } from 'koa';

// /**
//  * CORS middleware factory.
//  * @param options - Configuration options.
//  * @returns cors middleware
//  */
// declare function cors(options?: Options): Koa.Middleware;

/**
 * Middleware configuration options.
 */
interface Options {
  /**
   * `Access-Control-Allow-Origin`, default is '*'
   *
   * @remarks
   * If `credentials` set and return `true`, the `origin` default value will set to the request `Origin` header
   *
   * @remarks
   * If a function is provided, it will be called for each request with
   * the koa context object. It may return a string or a promise that
   * will resolve with a string.
   */
  origin?: ((ctx: Context) => string) | ((ctx: Context) => PromiseLike<string>) | string | undefined;

  /**
   * `Access-Control-Allow-Methods`, default is
   * 'GET,HEAD,PUT,POST,DELETE,PATCH'
   */
  allowMethods?: string[] | string | undefined | null;

  /**
   * `Access-Control-Expose-Headers`
   */
  exposeHeaders?: string[] | string | undefined;

  /**
   * `Access-Control-Allow-Headers`
   */
  allowHeaders?: string[] | string | undefined;

  /**
   * `Access-Control-Max-Age` in seconds
   */
  maxAge?: number | string | undefined;

  /**
   * `Access-Control-Allow-Credentials`
   *
   * @remarks
   * If a function is provided, it will be called for each request with
   * the koa context object. It may return a boolean or a promise that
   * will resolve with a boolean.
   */
  credentials?: ((ctx: Koa.Context) => boolean) | ((ctx: Koa.Context) => PromiseLike<boolean>) | boolean | undefined;

  /**
   * Add set headers to `err.header` if an error is thrown
   */
  keepHeadersOnError?: boolean | undefined;

  /**
   * Add `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy` to response headers, default is `false`
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/Planned_changes
   */
  secureContext?: boolean | undefined;

  /**
   * Handle `Access-Control-Request-Private-Network` request by return `Access-Control-Allow-Private-Network`, default is `false`
   *
   * @see https://wicg.github.io/private-network-access/
   */
  privateNetworkAccess?: boolean | undefined;
}

export type { Options };

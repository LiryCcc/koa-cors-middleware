import type { Middleware } from 'koa';
import vary from 'vary';
import { acac, acah, acam, acao, acapn, aceh, acrh, acrm, acrpn, coep, coop, rc, so } from './headers';
import type { Options } from './type';

const defaultOptions: Options = {
  allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  secureContext: false
};

const cors = (inputOptions?: Readonly<Options>): Middleware => {
  const options: Options = {
    ...defaultOptions,
    ...inputOptions
  };

  // http头中是用逗号分隔，所以将数组换为逗号，如果是undefined，那就继续为undefined
  options.exposeHeaders = (
    Array.isArray(options.exposeHeaders) ? options.exposeHeaders.join(',') : options.exposeHeaders
  ) as string;

  options.allowMethods = (
    Array.isArray(options.allowMethods) ? options.allowMethods.join(',') : options.allowMethods
  ) as string;

  options.allowHeaders = (
    Array.isArray(options.allowHeaders) ? options.allowHeaders.join(',') : options.allowHeaders
  ) as string;

  options.maxAge = options.maxAge?.toString() as string;

  options.keepHeadersOnError = (
    options.keepHeadersOnError === undefined ? true : options.keepHeadersOnError
  ) as boolean;

  const corsMiddleware: Middleware = async (ctx, next) => {
    const reqOrigin = ctx.get('Origin');
    ctx.vary('Origin');

    const credentials =
      typeof options.credentials === 'function' ? await options.credentials(ctx) : !!options.credentials;

    let origin = typeof options.origin === 'function' ? await options.origin(ctx) : options.origin || '*';
    if (!origin && typeof options.origin === 'function') {
      return await next();
    }
    if (credentials && origin === '*') {
      origin = reqOrigin;
    }
    const headerSet: Record<string, string> = {};
    const set = (k: string, v: string) => {
      ctx.set(k, v);
      headerSet[k] = v;
    };

    // 处理非预检请求，简单请求
    if (ctx.method.toUpperCase() !== 'OPTIONS') {
      set(acao, origin);

      if (credentials === true) {
        set(acac, credentials.toString());
      }

      if (options.exposeHeaders) {
        // 前面已经转换为string了
        set(aceh, Array.isArray(options.exposeHeaders) ? options.exposeHeaders.join(',') : options.exposeHeaders);
      }

      if (options.secureContext) {
        set(coop, so);
        set(coep, rc);
      }

      if (!options.keepHeadersOnError) {
        return await next();
      }
      try {
        return await next();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        const errHeadersSet = err.headers || {};
        const varyWithOrigin = vary.append(errHeadersSet.vary || errHeadersSet.Vary || '', 'Origin');
        delete errHeadersSet.Vary;

        err.headers = {
          ...errHeadersSet,
          ...headerSet,
          ...{ vary: varyWithOrigin }
        };
        throw err;
      }
    } else {
      // 处理预检请求
      if (!ctx.get(acrm)) {
        // 非预检请求，直接走下去
        return await next();
      }
      ctx.set(acao, origin);
      if (credentials === true) {
        ctx.set(acac, 'true');
      }
      if (options.maxAge) {
        ctx.set(acam, options.maxAge.toString());
      }

      if (options.privateNetworkAccess && ctx.get(acrpn)) {
        ctx.set(acapn, 'true');
      }
      if (options.allowMethods) {
        ctx.set(acam, options.allowMethods);
      }
      if (options.allowMethods) {
        ctx.set(acam, options.allowMethods);
      }

      if (options.secureContext) {
        set(coop, so);
        set(coep, rc);
      }

      let allowHeaders = options.allowHeaders;
      if (!allowHeaders) {
        allowHeaders = ctx.get(acrh);
      }
      if (allowHeaders) {
        ctx.set(acah, allowHeaders);
      }

      ctx.status = 204;
    }
  };
  return corsMiddleware;
};

const defaultCorsMiddleware = cors();

export { cors, defaultCorsMiddleware };
export default cors;

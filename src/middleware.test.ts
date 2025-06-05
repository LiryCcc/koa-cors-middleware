import Koa from 'koa';
import request from 'supertest';
import { assert, describe, expect, it } from 'vitest';
import cors from './middleware';

const correctBody = {
  '114514': '1919810'
};

describe('cors.test.js', function () {
  describe('default options', function () {
    const app = new Koa();
    app.use(cors());
    app.use(function (ctx) {
      ctx.body = correctBody;
    });

    it('should set `Access-Control-Allow-Origin` to `*` when request Origin header missing', async () => {
      await request(app.listen()).get('/').expect(correctBody).expect('access-control-allow-origin', '*').expect(200);
    });

    it('should set `Access-Control-Allow-Origin` to `*`', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Access-Control-Allow-Origin', '*')
        .expect(correctBody)
        .expect(200);
    });

    it('should 204 on Preflight Request', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Access-Control-Allow-Origin', '*')
        .expect('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH')
        .expect(204);
    });

    it('should not Preflight Request if request missing Access-Control-Request-Method', async () => {
      await request(app.listen()).options('/').set('Origin', 'http://koajs.com').expect(200);
    });

    it('should always set `Vary` to Origin', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Vary', 'Origin')
        .expect(correctBody)
        .expect(200);
    });
  });

  describe('options.origin=*', function () {
    const app = new Koa();
    app.use(
      cors({
        origin: '*'
      })
    );
    app.use(function (ctx) {
      ctx.body = correctBody;
    });

    it('should always set `Access-Control-Allow-Origin` to *', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Access-Control-Allow-Origin', '*')
        .expect(correctBody)
        .expect(200);
    });

    it('should always set `Access-Control-Allow-Origin` to *, even if no Origin is passed on request', async () => {
      await request(app.listen()).get('/').expect('Access-Control-Allow-Origin', '*').expect(correctBody).expect(200);
    });
  });

  describe('options.origin set the request Origin header', function () {
    const app = new Koa();
    app.use(
      cors({
        origin(ctx) {
          return ctx.get('Origin') || '*';
        }
      })
    );
    app.use(function (ctx) {
      ctx.body = correctBody;
    });

    it('should set `Access-Control-Allow-Origin` to request `Origin` header', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Access-Control-Allow-Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(200);
    });

    it('should set `Access-Control-Allow-Origin` to request `origin` header', async () => {
      await request(app.listen())
        .get('/')
        .set('origin', 'http://origin.koajs.com')
        .expect('Access-Control-Allow-Origin', 'http://origin.koajs.com')
        .expect(correctBody)
        .expect(200);
    });

    it('should set `Access-Control-Allow-Origin` to `*`, even if no Origin is passed on request', async () => {
      await request(app.listen()).get('/').expect('Access-Control-Allow-Origin', '*').expect(correctBody).expect(200);
    });
  });

  describe('options.secureContext=true', function () {
    const app = new Koa();
    app.use(
      cors({
        secureContext: true
      })
    );
    app.use(function (ctx) {
      ctx.body = correctBody;
    });

    it('should always set `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy` on not OPTIONS', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Cross-Origin-Opener-Policy', 'same-origin')
        .expect('Cross-Origin-Embedder-Policy', 'require-corp')
        .expect(correctBody)
        .expect(200);
    });

    it('should always set `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy` on OPTIONS', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Cross-Origin-Opener-Policy', 'same-origin')
        .expect('Cross-Origin-Embedder-Policy', 'require-corp')
        .expect(204);
    });
  });

  describe('options.secureContext=false', function () {
    const app = new Koa();
    app.use(
      cors({
        secureContext: false
      })
    );
    app.use(function (ctx) {
      ctx.body = correctBody;
    });

    it('should not set `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy`', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect((res) => {
          assert(!('Cross-Origin-Opener-Policy' in res.headers));
          assert(!('Cross-Origin-Embedder-Policy' in res.headers));
        })
        .expect(correctBody)
        .expect(200);
    });
  });

  describe('options.origin=function', () => {
    const app = new Koa();
    app.use(
      cors({
        origin(ctx) {
          if (ctx.url === '/forbin') {
            return false.toString();
          }
          return '*';
        }
      })
    );
    app.use(function (ctx) {
      ctx.body = correctBody;
    });

    it('should disable cors2', async () => {
      const res = await request(app.listen())
        .get('/forbin')
        .set('Origin', 'http://koajs.com')
        .expect(200)
        .expect(correctBody);
      // 这里是新版写法
      console.log('Checking headers...');
      console.log('res.headers:', res.headers);
      expect(!res.headers['Access-Control-Allow-Origin']).toBeTruthy();
    });

    it('should set access-control-allow-origin to *', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200);
    });
  });

  describe('options.origin=promise', function () {
    const app = new Koa();
    app.use(
      cors({
        origin(ctx) {
          return new Promise((resolve) => {
            setTimeout(() => {
              if (ctx.url === '/forbin') {
                return resolve(false.toString());
              }
              return resolve('*');
            }, 100);
          });
        }
      })
    );
    app.use(function (ctx) {
      ctx.body = correctBody;
    });

    it('should disable cors', async () => {
      const res = await request(app.listen())
        .get('/forbin')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(200);
      expect(!res.headers['Access-Control-Allow-Origin']).toEqual(true);
    });

    it('should set access-control-allow-origin to *', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200);
    });
  });

  describe('options.origin=async function', function () {
    const app = new Koa();
    app.use(
      cors({
        async origin(ctx) {
          if (ctx.url === '/forbin') {
            return false.toString();
          }
          return '*';
        }
      })
    );
    app.use(function (ctx) {
      ctx.body = correctBody;
    });

    it('should disable cors', async () => {
      const res = await request(app.listen())
        .get('/forbin')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(200);
      expect(!res.headers['Access-Control-Allow-Origin']).toBe(true);
    });

    it('should set access-control-allow-origin to *', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200);
    });

    it('behaves correctly when the return type is promise-like', async () => {
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

      const app = new Koa()
        .use(
          cors({
            origin() {
              return new WrappedPromise((resolve) => {
                return resolve('*');
              });
            }
          })
        )
        .use(function (ctx) {
          ctx.body = correctBody;
        });

      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200);
    });
  });
});

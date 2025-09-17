import Koa from 'koa';
import request from 'supertest';
import { assert, describe, expect, it } from 'vitest';
import { acac, acah, acam, acao, acapn, aceh, acrh, acrm, acrpn, coep, coop, rc, so } from './headers';
import cors from './middleware';
import { type HttpError } from './utils';

const correctBody = {
  '114514': '1919810'
};

describe('cors.test.js', () => {
  describe('default options', () => {
    const app = new Koa();
    app.use(cors());
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should set `Access-Control-Allow-Origin` to `*` when request Origin header missing', async () => {
      await request(app.listen()).get('/').expect(correctBody).expect(acao, '*').expect(200);
    });

    it('should set `Access-Control-Allow-Origin` to `*`', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acao, '*')
        .expect(correctBody)
        .expect(200);
    });

    it('should 204 on Preflight Request', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect(acao, '*')
        .expect(acam, 'GET,HEAD,PUT,POST,DELETE,PATCH')
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

  describe('options.origin=*', () => {
    const app = new Koa();
    app.use(
      cors({
        origin: '*'
      })
    );
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should always set `Access-Control-Allow-Origin` to *', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acao, '*')
        .expect(correctBody)
        .expect(200);
    });

    it('should always set `Access-Control-Allow-Origin` to *, even if no Origin is passed on request', async () => {
      await request(app.listen()).get('/').expect(acao, '*').expect(correctBody).expect(200);
    });
  });

  describe('options.origin set the request Origin header', () => {
    const app = new Koa();
    app.use(
      cors({
        origin(ctx) {
          return ctx.get('Origin') || '*';
        }
      })
    );
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should set `Access-Control-Allow-Origin` to request `Origin` header', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acao, 'http://koajs.com')
        .expect(correctBody)
        .expect(200);
    });

    it('should set `Access-Control-Allow-Origin` to request `origin` header', async () => {
      await request(app.listen())
        .get('/')
        .set('origin', 'http://origin.koajs.com')
        .expect(acao, 'http://origin.koajs.com')
        .expect(correctBody)
        .expect(200);
    });

    it('should set `Access-Control-Allow-Origin` to `*`, even if no Origin is passed on request', async () => {
      await request(app.listen()).get('/').expect(acao, '*').expect(correctBody).expect(200);
    });
  });

  describe('options.secureContext=true', () => {
    const app = new Koa();
    app.use(
      cors({
        secureContext: true
      })
    );
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should always set `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy` on not OPTIONS', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(coop, so)
        .expect(coep, rc)
        .expect(correctBody)
        .expect(200);
    });

    it('should always set `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy` on OPTIONS', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect(coop, so)
        .expect(coep, rc)
        .expect(204);
    });
  });

  describe('options.secureContext=false', () => {
    const app = new Koa();
    app.use(
      cors({
        secureContext: false
      })
    );
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should not set `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy`', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect((res) => {
          assert(!(coop in res.headers));
          assert(!(coep in res.headers));
        })
        .expect(correctBody)
        .expect(200);
    });
  });

  describe('options.origin=func', () => {
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
    app.use((ctx) => {
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
      expect(!res.headers[acao]).toBeTruthy();
    });

    it('should set access-control-allow-origin to *', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(acao, '*')
        .expect(200);
    });
  });

  describe('options.origin=promise', () => {
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
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should disable cors', async () => {
      const res = await request(app.listen())
        .get('/forbin')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(200);
      expect(!res.headers[acao]).toEqual(true);
    });

    it('should set access-control-allow-origin to *', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(acao, '*')
        .expect(200);
    });
  });

  describe('options.origin=async func', () => {
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
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should disable cors', async () => {
      const res = await request(app.listen())
        .get('/forbin')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(200);
      expect(!res.headers[acao]).toBe(true);
    });

    it('should set access-control-allow-origin to *', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(acao, '*')
        .expect(200);
    });

    it('behaves correctly when the return type is promise-like', async () => {
      const app = new Koa()
        .use(
          cors({
            origin() {
              return new Promise((resolve) => {
                return resolve('*');
              });
            }
          })
        )
        .use((ctx) => {
          ctx.body = correctBody;
        });

      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(acao, '*')
        .expect(200);
    });
  });

  describe('options.exposeHeaders', () => {
    it('should Access-Control-Expose-Headers: `content-length`', async () => {
      const app = new Koa();
      app.use(
        cors({
          exposeHeaders: 'content-length'
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
      });

      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(aceh, 'content-length')
        .expect(correctBody)
        .expect(200);
    });

    it('should work with array', async () => {
      const app = new Koa();
      app.use(
        cors({
          exposeHeaders: ['content-length', 'x-header']
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
      });

      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(aceh, 'content-length,x-header')
        .expect(correctBody)
        .expect(200);
    });
  });

  describe('options.credentials', () => {
    const app = new Koa();
    app.use(
      cors({
        credentials: true
      })
    );
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should enable Access-Control-Allow-Credentials on Simple request', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acac, 'true')
        .expect(correctBody)
        .expect(200);
    });

    it('should enable Access-Control-Allow-Credentials on Preflight request', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'DELETE')
        .expect(acac, 'true')
        .expect(204);
    });
  });

  describe('options.credentials unset', () => {
    const app = new Koa();
    app.use(cors());
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should disable Access-Control-Allow-Credentials on Simple request', async () => {
      const res = await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(200);
      expect(!res.header[acac]).toBe(true);
    });

    it('should disable Access-Control-Allow-Credentials on Preflight request', async () => {
      const res = await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'DELETE')
        .expect(204);

      const header = res.headers[acac];
      assert.equal(!header, true, 'Access-Control-Allow-Credentials must not be set.');
    });
  });

  describe('options.credentials=function', () => {
    const app = new Koa();
    app.use(
      cors({
        credentials(ctx) {
          return ctx.url !== '/forbin';
        }
      })
    );
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should enable Access-Control-Allow-Credentials on Simple request', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acac, 'true')
        .expect(correctBody)
        .expect(200);
    });

    it('should enable Access-Control-Allow-Credentials on Preflight request', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'DELETE')
        .expect(acac, 'true')
        .expect(204);
    });

    it('should disable Access-Control-Allow-Credentials on Simple request', async () => {
      const res = await request(app.listen())
        .get('/forbin')
        .set('Origin', 'http://koajs.com')
        .expect(correctBody)
        .expect(200);

      const header = res.headers[acac];
      assert.equal(header, undefined, 'Access-Control-Allow-Credentials must not be set.');
    });

    it('should disable Access-Control-Allow-Credentials on Preflight request', async () => {
      const res = await request(app.listen())
        .options('/forbin')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'DELETE')
        .expect(204);
      const header = res.headers[acac];
      assert.equal(header, undefined, 'Access-Control-Allow-Credentials must not be set.');
    });
  });

  describe('options.credentials=async function', () => {
    const app = new Koa();
    app.use(
      cors({
        async credentials() {
          return true;
        }
      })
    );
    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should enable Access-Control-Allow-Credentials on Simple request', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acac, 'true')
        .expect(correctBody)
        .expect(200);
    });

    it('should enable Access-Control-Allow-Credentials on Preflight request', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'DELETE')
        .expect(acac, 'true')
        .expect(204);
    });

    it('behaves correctly when the return type is promise-like', async () => {
      const app = new Koa()
        .use(
          cors({
            credentials() {
              return new Promise((resolve) => {
                resolve(true);
              });
            }
          })
        )
        .use((ctx) => {
          ctx.body = correctBody;
        });

      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acac, 'true')
        .expect(correctBody)
        .expect(200);
    });
  });

  describe('options.allowHeaders', () => {
    it('should work with allowHeaders is string', async () => {
      const app = new Koa();
      app.use(
        cors({
          allowHeaders: 'X-PINGOTHER'
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
      });

      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect(acah, 'X-PINGOTHER')
        .expect(204);
    });

    it('should work with allowHeaders is array', async () => {
      const app = new Koa();
      app.use(
        cors({
          allowHeaders: ['X-PINGOTHER']
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
      });

      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect(acah, 'X-PINGOTHER')
        .expect(204);
    });

    it('should set Access-Control-Allow-Headers to request access-control-request-headers header', async () => {
      const app = new Koa();
      app.use(cors());
      app.use((ctx) => {
        ctx.body = correctBody;
      });

      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .set(acrh, 'X-PINGOTHER')
        .expect(acah, 'X-PINGOTHER')
        .expect(204);
    });
  });

  describe('options.allowMethods', () => {
    it('should work with allowMethods is array', async () => {
      const app = new Koa();
      app.use(
        cors({
          allowMethods: ['GET', 'POST']
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
      });

      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect(acam, 'GET,POST')
        .expect(204);
    });

    it('should skip allowMethods', async () => {
      const app = new Koa();
      app.use(
        cors({
          allowMethods: null
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
      });

      await request(app.listen()).options('/').set('Origin', 'http://koajs.com').set(acrm, 'PUT').expect(204);
    });
  });

  describe('options.headersKeptOnError', () => {
    it('should keep CORS headers after an error', async () => {
      const app = new Koa();
      app.use(
        cors({
          origin(ctx) {
            return ctx.get('Origin') || '*';
          }
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
        throw new Error('Whoops!');
      });

      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acao, 'http://koajs.com')
        .expect('Vary', 'Origin')
        .expect(/Error/)
        .expect(500);
    });

    it('should not affect OPTIONS requests', async () => {
      const app = new Koa();
      app.use(
        cors({
          origin(ctx) {
            return ctx.get('Origin') || '*';
          }
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
        throw new Error('Whoops!');
      });

      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect(acao, 'http://koajs.com')
        .expect(204);
    });

    it('should not keep unrelated headers', async () => {
      const app = new Koa();
      app.use(
        cors({
          origin(ctx) {
            return ctx.get('Origin') || '*';
          }
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
        ctx.set('X-Example', 'Value');
        throw new Error('Whoops!');
      });

      const res = await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acao, 'http://koajs.com')
        .expect(/Error/)
        .expect(500);

      assert(!res.headers['x-example']);
    });

    it('should not keep CORS headers after an error if keepHeadersOnError is false', async () => {
      const app = new Koa();
      app.use(
        cors({
          keepHeadersOnError: false
        })
      );
      app.use((ctx) => {
        ctx.body = correctBody;
        throw new Error('Whoops!');
      });

      const res = await request(app.listen()).get('/').set('Origin', 'http://koajs.com').expect(/Error/).expect(500);
      assert(!res.headers[acao]);
      assert(!res.headers.vary);
    });
  });

  describe('other middleware has been set `Vary` header to Accept-Encoding', () => {
    const app = new Koa();
    app.use(function (ctx, next) {
      ctx.set('Vary', 'Accept-Encoding');
      return next();
    });

    app.use(cors());

    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should append `Vary` header to Origin', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Vary', 'Accept-Encoding, Origin')
        .expect(correctBody)
        .expect(200);
    });
  });

  describe('other middleware has set vary header on Error', () => {
    it('should append `Origin to other `Vary` header', async () => {
      const app = new Koa();
      app.use(cors());

      app.use((ctx) => {
        ctx.body = correctBody;
        const error = new Error('Whoops!') as HttpError;
        error.headers = { Vary: 'Accept-Encoding' };
        throw error;
      });

      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Vary', 'Accept-Encoding, Origin')
        .expect(/Error/)
        .expect(500);
    });
    it('should preserve `Vary: *`', async () => {
      const app = new Koa();
      app.use(cors());

      app.use((ctx) => {
        ctx.body = correctBody;
        const error = new Error('Whoops!') as HttpError;
        error.headers = { Vary: '*' };
        throw error;
      });

      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Vary', '*')
        .expect(/Error/)
        .expect(500);
    });
    it('should not append Origin` if already present in `Vary`', async () => {
      const app = new Koa();
      app.use(cors());

      app.use((ctx) => {
        ctx.body = correctBody;
        const error = new Error('Whoops!') as HttpError;
        error.headers = { Vary: 'Origin, Accept-Encoding' };
        throw error;
      });

      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect('Vary', 'Origin, Accept-Encoding')
        .expect(/Error/)
        .expect(500);
    });
  });

  describe('options.privateNetworkAccess=false', () => {
    const app = new Koa();
    app.use(
      cors({
        privateNetworkAccess: false
      })
    );

    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should not set `Access-Control-Allow-Private-Network` on not OPTIONS', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect((res) => {
          assert(!(acapn in res.headers));
        })
        .expect(200);
    });

    it('should not set `Access-Control-Allow-Private-Network` if `Access-Control-Request-Private-Network` not exist on OPTIONS', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect((res) => {
          assert(!(acapn in res.headers));
        })
        .expect(204);
    });

    it('should not set `Access-Control-Allow-Private-Network` if `Access-Control-Request-Private-Network` exist on OPTIONS', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .set(acrpn, 'true')
        .expect((res) => {
          assert(!(acapn in res.headers));
        })
        .expect(204);
    });
  });

  describe('options.privateNetworkAccess=true', () => {
    const app = new Koa();
    app.use(
      cors({
        privateNetworkAccess: true
      })
    );

    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('should not set `Access-Control-Allow-Private-Network` on not OPTIONS', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect((res) => {
          assert(!(acapn in res.headers));
        })
        .expect(200);
    });

    it('should not set `Access-Control-Allow-Private-Network` if `Access-Control-Request-Private-Network` not exist on OPTIONS', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .expect((res) => {
          assert(!(acapn in res.headers));
        })
        .expect(204);
    });

    it('should always set `Access-Control-Allow-Private-Network` if `Access-Control-Request-Private-Network` exist on OPTIONS', async () => {
      await request(app.listen())
        .options('/')
        .set('Origin', 'http://koajs.com')
        .set(acrm, 'PUT')
        .set(acrpn, 'true')
        .expect(acapn, 'true')
        .expect(204);
    });
  });

  describe('options.origin=*, and options.credentials=true', () => {
    const app = new Koa();
    app.use(
      cors({
        origin: '*',
        credentials: true
      })
    );

    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('Access-Control-Allow-Origin should be request.origin, and Access-Control-Allow-Credentials should be true', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acac, 'true')
        .expect(acao, 'http://koajs.com')
        .expect(correctBody)
        .expect(200);
    });
  });

  describe('options.origin=*, and options.credentials=false', () => {
    const app = new Koa();
    app.use(
      cors({
        origin: '*',
        credentials: false
      })
    );

    app.use((ctx) => {
      ctx.body = correctBody;
    });

    it('Access-Control-Allow-Origin should be *', async () => {
      await request(app.listen())
        .get('/')
        .set('Origin', 'http://koajs.com')
        .expect(acao, '*')
        .expect(correctBody)
        .expect(200);
    });
  });
});

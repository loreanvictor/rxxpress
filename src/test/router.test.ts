import { testWithApp as test } from './util';

import { Method } from '../types';
import { Router } from '../router';


describe('Router', () => {
  describe('.on()', function() {
    it('should setup a route on given path and method, returning a proper Subject.', done => {
      test(
        app => {
          const router = new Router();
          router.on('get', '/').subscribe(({res}) => res.status(200).send('hellow!'));
          app.use(router.core);
        },
        (req, cleanup) => {
          req.get('/').end((_, res) => {
            cleanup();
            res.text.should.equal('hellow!');
            res.status.should.equal(200);
            done();
          });
        }
      );
    });

    it('should be possible to not provide a path Subject.', done => {
      test(
        app => {
          const router = new Router();
          router.on('get').subscribe(({req, next}) => {req._.msg = 'WOW!'; next()});
          router.get('/whatevs').subscribe(({req, res}) => res.send(req._.msg));
          app.use(router.core);
        },
        (req, cleanup) => {
          req.get('/whatevs').end((_, res) => {
            cleanup();
            res.text.should.equal('WOW!');
            res.status.should.equal(200);
            done();
          });
        },
      );
    });
  });

  describe('.use()', () => {
    it('should be possible to provide middlewares via `.use()` method.', done => {
      test(
        app => {
          const router = new Router();
          router.use().subscribe(({req, next}) => {req._.name = 'World'; next()});
          router.post('/stuff').subscribe(({req, res}) => res.send(`Hello ${req._.name}`));
          app.use(router.core);
        },
        (req, cleanup) => {
          req.post('/stuff').end((_, res) => {
            cleanup();
            res.text.should.equal('Hello World');
            res.status.should.equal(200);
            done();
          });
        }
      );
    });

    it('should be possible to provide fallbacks on a specific router.', done => {
      test(
        app => {
          const router = new Router();
          router.use('/stuff').subscribe(({res}) => res.send('42'));
          app.use(router.core);
        },
        (req, cleanup) => {
          req.delete('/stuff').end((_, res) => {
            cleanup();
            res.text.should.equal('42');
            res.status.should.equal(200);
            done();
          });
        }
      );
    });
  });

  const methods: Exclude<Method, 'm-search'>[] = [ 
      'checkout' , 'copy'       , 'delete' , 'get'    , 'head'     , 'lock' 
    , 'merge'    , 'mkactivity' , 'mkcol'  , 'move'   ,              'notify'
    , 'options'  , 'patch'      , 'post'   , 'purge'  , 'put'      , 'report'
    , 'search'   , 'subscribe'  , 'trace'  , 'unlock' , 'unsubscribe'];

  methods.forEach(method => {
    describe(`.${method}()`, () => {
      it(`should respond to requests with ${method} method and given path.`, done => {
        test(
          app => {
            const router = new Router();
            router[method].apply(router, ['/whatev']).subscribe(({res}: any) => res.sendStatus(418));
            app.use(router.core);
          },
          (req, cleanup) => {
            req[method].apply(req, ['/whatev']).end((_: any, res: ChaiHttp.Response) => {
              cleanup();
              res.status.should.equal(418);
              done();
            });
          }
        )
      });
    });
  });

  describe(`.all()`, () => {
    it(`should respond to requests with anyh method and given path.`, done => {
      test(
        app => {
          const router = new Router();
          router.all('/whatev').subscribe(({res}: any) => res.sendStatus(418));
          app.use(router.core);
        },
        (req, cleanup) => {
          req[methods[Math.floor(Math.random() * methods.length)]]
          .apply(req, ['/whatev']).end((_: any, res: ChaiHttp.Response) => {
            cleanup();
            res.status.should.equal(418);
            done();
          });
        }
      )
    });
  });
});
import { test } from './util';

import { timer, of } from 'rxjs';
import { tap, delayWhen } from 'rxjs/operators';

import { Router } from '../router';
import { join } from '../join';
import { use } from '../use';
import { json } from '../respond';


describe('join()', () => {
  it('should merge incoming requests properly.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/:name').pipe(
          endpoint => join(
            endpoint.pipe(
              delayWhen(({req}) => req.params.name === 'john' ? timer(10) : of()),
              tap(({req}) => req._.x = req.params.name.length)
            ),
            endpoint.pipe(tap(({req}) => req._.y = `halo ${req.params.name}`))
          ),
          json(({req}) => req._)
        )
        .subscribe();
        app.use(router.core);
      },
      async (req, cleanup) => {
        const res: any[] = [];
        await Promise.all([
          req.get('/john').then(r => res.push(JSON.parse(r.text))),
          req.get('/jullian').then(r => res.push(JSON.parse(r.text)))
        ]);

        cleanup();
        res[0].y.should.equal('halo jullian'); res[0].x.should.equal(7);
        res[1].y.should.equal('halo john'); res[1].x.should.equal(4);
        done();
      }
    )
  });

  it('should ignore requests that are responded to.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          endpoint => join()(
            endpoint.pipe(use((_, res, next) => { 
              res.send();
              next();
            })),
            endpoint.pipe(tap(({req}) => req._.x = 2))
          )
        )
        .subscribe(() => done());

        app.use(router.core);
      },
      async (req, cleanup) => {
        await req.get('/');
        cleanup();
        done();
      }
    )
  });

  it('should throw out requests that are respondend to.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          endpoint => join()(
            endpoint.pipe(use((_, res, next) => { 
              setTimeout(() => {
                res.send();
                next();
              }, 20);
            })),
            endpoint.pipe(tap(({req}) => req._.x = 2))
          )
        )
        .subscribe(() => done());

        app.use(router.core);
      },
      async (req, cleanup) => {
        await req.get('/');
        cleanup();
        done();
      }
    )
  });

  it('should pass along requests that are responded to when safe mode is turned off.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          endpoint => join({safe: false})(
            endpoint.pipe(use((_, res, next) => { 
              res.send();
              next();
            })),
            endpoint.pipe(tap(({req}) => req._.x = 2))
          )
        )
        .subscribe(() => done());

        app.use(router.core);
      },
      async (req, cleanup) => {
        await req.get('/');
        cleanup();
      }
    )
  });

  it('should keep requests that are responded to when safe mode is turned off.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          endpoint => join({safe: false})(
            endpoint.pipe(use((_, res, next) => {
              setTimeout(() => {
                res.send();
                next();
              }, 20);
            })),
            endpoint.pipe(tap(({req}) => req._.x = 2))
          )
        )
        .subscribe(() => done());

        app.use(router.core);
      },
      async (req, cleanup) => {
        await req.get('/');
        cleanup();
      }
    )
  });
});

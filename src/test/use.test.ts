import { test } from './util';

import { Router as R } from 'express';
import { tap } from 'rxjs/operators';

import { Req } from '../types';
import { use } from '../use';
import { Router } from '../router';


describe('use()', () => {
  it('should allow piping an express router to a router.', done => {
    test(
      app => {
        const _R = R();
        _R.get('/world', (req, res) => res.send(`${(req as Req)._.msg} World!`));

        const router = new Router();
        router.use('/hello').pipe(
          tap(({req}) => req._.msg = 'Hello'),
          use(_R),
          tap(({res}) => res.send('Hello John!'))
        ).subscribe();

        router.use('/goodbye').pipe(
          tap(({req}) => req._.msg = 'Good Bye'),
          use(_R)
        ).subscribe();

        app.use(router.core);
      },
      (req, cleanup) => {
        Promise.all([req.get('/hello/world'), req.get('/goodbye/world'), req.get('/hello/jack')])
        .then(([hi, bye, hmmm]) => {
          cleanup();
          hi.text.should.equal('Hello World!');
          bye.text.should.equal('Good Bye World!');
          hmmm.text.should.equal('Hello John!');
          done();
        });
      },
    )
  });

  it('should allow using middleware functions with routers.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/:place').pipe(
          use((req, res, next) => {
            if (req.params.place === 'machine') next();
            else res.send('Wrong address');
          }),
          tap(({res}) => res.send('Welcome to the machine'))
        ).subscribe();
        app.use(router.core);
      },
      (req, cleanup) => {
        Promise.all([req.get('/machine'), req.get('/school')])
        .then(([a, b]) => {
          cleanup();
          a.text.should.equal('Welcome to the machine');
          b.text.should.equal('Wrong address');
          done();
        });
      }
    )
  });

  it('should allow combining routers with each other.', done => {
    test(
      app => {
        const sub = new Router();
        sub.get('/world').subscribe(({res}) => res.send('Hello World'));

        const router = new Router();
        router.use('/hello').pipe(
          use(sub),
          tap(({res}) => res.send('I do not know you.'))
        ).subscribe();

        app.use(router.core);
      },
      (req, cleanup) => {
        Promise.all([req.get('/hello/world'), req.get('/hello/john')])
        .then(([a, b]) => {
          cleanup();
          a.text.should.equal('Hello World');
          b.text.should.equal('I do not know you.');
          done();
        });
      }
    )
  });

  it('should catch errors.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          use((_, res) => { res.sendStatus(500); throw Error() })
        ).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').end(() => {
          cleanup();
        });
      }
    )
  });

  it('should error out if error is provided to `next()`.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          use((_, res, next) => { res.sendStatus(500); next(Error()) })
        ).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').end(() => {
          cleanup();
        });
      }
    )
  });

  it('should pass down errors.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          use((_, res) => { res.sendStatus(500); throw Error() }),
          use(() => {}),
        ).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').end(() => {
          cleanup();
        });
      }
    )
  });

  it('should complete when source completes.', done => {
    const router = new Router();
    const endpoint = router.get('/');
    endpoint.pipe(use(() => {})).subscribe(undefined, undefined, () => done());
    endpoint.complete();
  });
});

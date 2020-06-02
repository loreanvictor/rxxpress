import { testWithApp as test } from './util';

import { tap } from 'rxjs/operators';

import { Router } from '../router';
import { next } from '../next';
import { use } from '../use';


describe('next()', () => {
  it('should pass the packet to the next handler.', done => {
    test(
      app => {
        const router = new Router();
        router.all('*').pipe(
          tap(({req}) => req._.name = 'Johny'),
          next()
        ).subscribe();
        app.use(router.core);
        app.get('/hello', (req: any, res) => res.send(`Hi ${req._.name}`));
        app.get('/goodbye', (req: any, res) => res.send(`Ciao ${req._.name}`));
      },
      (req, cleanup) => {
        Promise.all([req.get('/hello'), req.get('/goodbye')])
        .then(([a, b]) => {
          cleanup();
          a.text.should.equal('Hi Johny');
          b.text.should.equal('Ciao Johny');
          done();
        });
      }
    )
  });

  it('should by default only pass to next handler if the request is not responded.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/:name').pipe(
          tap(({req, res}) => {
            if (req.params.name === 'eugene') res.send('Halo Eugene!');
          }),
          next()
        ).subscribe();
        app.use(router.core);
        app.get('*', (_, res) => res.sendStatus(418));
      },
      (req, cleanup) => {
        Promise.all([req.get('/eugene'), req.get('/sesajd')])
        .then(([a, b]) => {
          cleanup();
          a.text.should.equal('Halo Eugene!');
          b.status.should.equal(418);
          done();
        });
      }
    )
  });

  it('should pass to next handler despite request being responded in unsafe mode.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          tap(({res}) => res.send('Halo')),
          next(false)
        ).subscribe();
        app.use(router.core);
        app.get('/', () => done());
      },
      (req, cleanup) => {
        req.get('/').end(() => cleanup());
      }
    )
  });

  it('should not pass the packet to subsequent observers.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          next(),
          tap(() => done())
        ).subscribe();
        app.use(router.core);
        app.get('/', (_, res) => {
          res.send('');
          done();
        });
      },
      (req, cleanup) => {
        req.get('/').end(() => cleanup());
      }
    )
  });

  it('should pass down errors.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(
          use((_, res) => {
            res.sendStatus(500);
            throw Error();
          }),
          next()
        ).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(() => cleanup());
      }
    )
  });

  it('should complete subscribers on completion.', done => {
    const router = new Router();
    const endpoint = router.get('/');
    endpoint.pipe(next()).subscribe(undefined, undefined, () => done());
    (endpoint as any).complete();
  });
});

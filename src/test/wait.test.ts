import { testWithRouter as test } from './util';


import { Router } from '../router';
import { wait } from '../wait';
import { respond } from '../respond';
import { of, throwError } from 'rxjs';
import { delay, tap, mergeMap } from 'rxjs/operators';
import { use } from '../use';


describe('wait()', () => {
  it('should do something to each packet and return it.', done => {
    test(
      router => {
        router.get('/').pipe(
          wait(({req}) => req._.x = 'halo'),
          respond(({req}) => req._.x)
        ).subscribe();
      },
      async (req, cleanup) => {
        const res = await req.get('/');
        cleanup();
        res.text.should.equal('halo');
        done();
      }
    )
  });

  it('should work with async functions.', done => {
    test(
      router => {
        router.get('/').pipe(
          wait(({req}) => new Promise(resolve => {
            setTimeout(() => {
              req._.x = 'halo';
              resolve();
            }, 20);
          })),
          respond(({req}) => req._.x.should.equal('halo'))
        ).subscribe();
      },
      async (req, cleanup) => {
        await req.get('/');
        cleanup();
        done();
      }
    )
  });

  it('should work with observable functions.', done => {
    test(
      router => {
        router.get('/').pipe(
          wait(({req}) => of(true).pipe(
            delay(20),
            tap(() => req._.x = 'halo'),
          )),
          respond(({req}) => req._.x.should.equal('halo'))
        ).subscribe();
      },
      async (req, cleanup) => {
        await req.get('/');
        cleanup();
        done();
      }
    )
  });

  it('should catch errors.', done => {
    test(
      router => {
        router.get('/').pipe(
          wait(packet => { packet.res.send(); throw Error() }),
        ).subscribe(() => {}, () => done());
      },
      async (req, cleanup) => {
        await req.get('/');
        cleanup();
      }
    )
  });

  it('should catch async errors.', done => {
    test(
      router => {
        router.get('/').pipe(
          wait(packet => new Promise((_, reject) => { 
            packet.res.send();
            reject(Error());
        })),
        ).subscribe(() => {}, () => done());
      },
      async (req, cleanup) => {
        await req.get('/');
        cleanup();
      }
    )
  });

  it('should catch observable errors.', done => {
    test(
      router => {
        router.get('/').pipe(
          wait(packet => of(true).pipe(
            tap(() => packet.res.send()),
            mergeMap(() => throwError(Error())),
          )),
        ).subscribe(() => {}, () => done());
      },
      async (req, cleanup) => {
        await req.get('/');
        cleanup();
      }
    )
  });

  it('should pass down errors.', done => {
    test(
      router => {
        router.get('/').pipe(
          use((_, res) => {
            res.sendStatus(500);
            throw Error();
          }),
          wait(() => {}),
        ).subscribe(() => {}, () => done());
      },
      (req, cleanup) => {
        req.get('/').then(() => cleanup());
      }
    )
  });

  it('should complete subscribers on completion.', done => {
    const router = new Router();
    const endpoint = router.get('/');
    endpoint.pipe(wait(() => {})).subscribe(undefined, undefined, () => done());
    (endpoint as any).complete();
  });
});

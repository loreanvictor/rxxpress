import { testWithRouter as test } from './util';

import { of } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

import { Router } from '../router';
import { respond } from '../respond';
import { use } from '../use';
import { timeout } from '../timeout';


describe('timeout()', () => {
  it('should respond automatically with 408 after given timeout.', done => {
    test(
      router => {
        router.get('/:delay').pipe(
          timeout(20),
          mergeMap((packet) => of(packet).pipe(delay(parseInt(packet.req.params.delay)))),
          respond(() => 'Done!')
        ).subscribe(undefined, () => {});
      },
      (req, cleanup) => {
        Promise.all([req.get('/40'), req.get('/10')])
        .then(([a, b]) => {
          cleanup();
          a.status.should.equal(408);
          b.status.should.equal(200);
          done();
        });
      }
    )
  });

  it('should emit an error in unsafe mode.', done => {
    test(
      router => {
        router.get('/').pipe(timeout(10, false), delay(20)).subscribe(
          undefined,
          () => done()
        );
      },
      (req, cleanup) => {
        req.get('/').end(() => cleanup());
      }
    )
  });

  it('should not emit an error by default.', done => {
    test(
      router => {
        router.get('/').pipe(timeout(10), delay(20)).subscribe(
          undefined,
          () => done()
        );
      },
      (req, cleanup) => {
        req.get('/').end(() => {
          cleanup();
          done();
        });
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
          timeout(10)
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
    endpoint.pipe(timeout(10)).subscribe(undefined, undefined, () => done());
    (endpoint as any).complete();
  });
});
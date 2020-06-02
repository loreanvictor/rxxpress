import { testWithRouter as test } from './util';

import { of, throwError } from 'rxjs';
import { delay, tap, mergeMap } from 'rxjs/operators';

import { Router } from '../router';
import { respond } from '../respond';
import { use } from '../use';
import { check, validate, authorize, allow, find } from '../check';


describe('check()', () => {
  it('should check using given check function and either next or return with given status and msg,', done => {
    test(
      router => {
        router.get('/:name').pipe(
          check(({req}) => req.params.name === 'dude', {
            status: 418,
            message: 'You are not dude, I am a teapot.'
          }),
          respond(() => 'Welcome dude!'),
        ).subscribe();
      },
      (req, cleanup) => {
        Promise.all([req.get('/john'), req.get('/dude')])
        .then(([a, b]) => {
          cleanup();
          a.status.should.equal(418); a.text.should.equal('You are not dude, I am a teapot.');
          b.status.should.equal(200); b.text.should.equal('Welcome dude!');
          done();
        });
      }
    )
  });

  it('should default to status 500 and empty text.', done => {
    test(
      router => {
        router.get('/').pipe(check(() => false)).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(500);
          res.text.should.equal('');
          done();
        });
      }
    )
  });

  it('should work with async checks.', done => {
    test(
      router => {
        router.get('/').pipe(check(() => new Promise(resolve => resolve(false)))).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(500);
          res.text.should.equal('');
          done();
        });
      }
    )
  });

  it('should work with observables.', done => {
    test(
      router => {
        router.get('/:name').pipe(
          check(({req}) => of(req.params.name === 'dude').pipe(delay(10))),
          respond(() => 'Halo dude!'),
        ).subscribe();
      },
      (req, cleanup) => {
        Promise.all([req.get('/dude'), req.get('/bro')])
        .then(([a, b]) => {
          cleanup();
          a.status.should.equal(200);
          b.status.should.equal(500);
          done();
        });
      }
    )
  });

  it('should catch errors.', done => {
    test(
      router => {
        router.get('/').pipe(check(({res}) => { res.sendStatus(500); throw Error() }))
        .subscribe(
          () => {},
          () => done()
        );
      },
      (req, cleanup) => {
        req.get('/').end(() => cleanup());
      }
    )
  });

  it('should catch async errors.', done => {
    test(
      router => {
        router.get('/').pipe(check(({res}) => new Promise((_, reject) => { 
          res.sendStatus(500);
          reject();
        })))
        .subscribe(
          () => {},
          () => done()
        );
      },
      (req, cleanup) => {
        req.get('/').end(() => cleanup());
      }
    )
  });

  it('should catch observable errors.', done => {
    test(
      router => {
        router.get('/').pipe(check(({res}) => of(false).pipe(
          tap(() => res.sendStatus(500)),
          mergeMap(() => throwError(Error()))
        )))
        .subscribe(
          () => {},
          () => done()
        );
      },
      (req, cleanup) => {
        req.get('/').end(() => cleanup());
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
          check(() => true)
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
    endpoint.pipe(check(() => true)).subscribe(undefined, undefined, () => done());
    (endpoint as any).complete();
  });
});


describe('validate()', () => {
  it('should be a `check()` with 400 default status.', done => {
    test(
      router => {
        router.get('/').pipe(validate(() => false)).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(400);
          done();
        });
      }
    )
  });

  it('should work with custom messages.', done => {
    test(
      router => {
        router.get('/').pipe(validate(() => false, 'No man!')).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(400);
          res.text.should.equal('No man!');
          done();
        });
      }
    )
  });
});

describe('authorize()', () => {
  it('should be a `check()` with 401 default status.', done => {
    test(
      router => {
        router.get('/').pipe(authorize(() => false)).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(401);
          done();
        });
      }
    )
  });

  it('should work with custom messages.', done => {
    test(
      router => {
        router.get('/').pipe(authorize(() => false, 'No man!')).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(401);
          res.text.should.equal('No man!');
          done();
        });
      }
    )
  });
});


describe('allow()', () => {
  it('should be a `check()` with 403 default status.', done => {
    test(
      router => {
        router.get('/').pipe(allow(() => false)).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(403);
          done();
        });
      }
    )
  });

  it('should work with custom messages.', done => {
    test(
      router => {
        router.get('/').pipe(allow(() => false, 'No man!')).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(403);
          res.text.should.equal('No man!');
          done();
        });
      }
    )
  });
});


describe('find()', () => {
  it('should be a `check()` with 404 default status.', done => {
    test(
      router => {
        router.get('/').pipe(find(() => false)).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(404);
          done();
        });
      }
    )
  });

  it('should work with custom messages.', done => {
    test(
      router => {
        router.get('/').pipe(find(() => false, 'No man!')).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(404);
          res.text.should.equal('No man!');
          done();
        });
      }
    )
  });
});
import { testWithRouter as test } from './util';

import { tap } from 'rxjs/operators';

import { Router } from '../router';
import { use } from '../use';
import { reject, badrequest, unauthorized, forbidden, notfound } from '../reject';


describe('reject()', () => {
  it('should respond with given error status and message.', done => {
    test(
      router => {
        router.get('/').pipe(reject(500, 'Mate!')).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(500);
          res.text.should.equal('Mate!');
          done();
        });
      }
    )
  });

  it('should default to empty message if no message specified.', done => {
    test(
      router => {
        router.get('/').pipe(reject(418)).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(418);
          res.text.should.equal('');
          done();
        });
      }
    )
  });

  it('should only respond if the request is not responded to yet.', done => {
    test(
      router => {
        router.get('/:name').pipe(
          tap(({req, res}) => {
            if (req.params.name === 'a') res.sendStatus(418);
          }),
          reject(400),
        ).subscribe();
      },
      (req, cleanup) => {
        Promise.all([req.get('/a'), req.get('/b')])
        .then(([a, b]) => {
          cleanup();
          a.status.should.equal(418);
          b.status.should.equal(400);
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
          reject(418)
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
    endpoint.pipe(reject(418)).subscribe(undefined, undefined, () => done());
    (endpoint as any).complete();
  });
});


describe('badrequest()', () => {
  it('should be like `reject()` with 400 status.', done => {
    test(
      router => {
        router.get('/').pipe(badrequest()).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(400);
          res.text.should.equal('');
          done();
        });
      }
    )
  });

  it('should be possible to use a custom message.', done => {
    test(
      router => {
        router.get('/').pipe(badrequest('I hate you!')).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(400);
          res.text.should.equal('I hate you!');
          done();
        });
      }
    )
  });
});


describe('unauthorized()', () => {
  it('should be like `reject()` with 401 status.', done => {
    test(
      router => {
        router.get('/').pipe(unauthorized()).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(401);
          res.text.should.equal('');
          done();
        });
      }
    )
  });

  it('should be possible to use a custom message.', done => {
    test(
      router => {
        router.get('/').pipe(unauthorized('I hate you!')).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(401);
          res.text.should.equal('I hate you!');
          done();
        });
      }
    )
  });
});


describe('forbidden()', () => {
  it('should be like `reject()` with 403 status.', done => {
    test(
      router => {
        router.get('/').pipe(forbidden()).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(403);
          res.text.should.equal('');
          done();
        });
      }
    )
  });

  it('should be possible to use a custom message.', done => {
    test(
      router => {
        router.get('/').pipe(forbidden('I hate you!')).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(403);
          res.text.should.equal('I hate you!');
          done();
        });
      }
    )
  });
});


describe('notfound()', () => {
  it('should be like `reject()` with 404 status.', done => {
    test(
      router => {
        router.get('/').pipe(notfound()).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(404);
          res.text.should.equal('');
          done();
        });
      }
    )
  });

  it('should be possible to use a custom message.', done => {
    test(
      router => {
        router.get('/').pipe(notfound('I hate you!')).subscribe();
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.status.should.equal(404);
          res.text.should.equal('I hate you!');
          done();
        });
      }
    )
  });
});
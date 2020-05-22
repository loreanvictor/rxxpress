import { test } from './util';

import { throwError } from 'rxjs';
import { tap, delay, mergeMap } from 'rxjs/operators';

import { Router } from '../router';
import { respond, json } from '../respond';
import { use } from '../use';
import { of } from 'rxjs';


describe('respond()', () => {
  it('should respond using given function.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(respond(() => 'Hellow!')).subscribe();
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.text.should.equal('Hellow!');
          done();
        });
      }
    )
  });

  it('should only respond if there is no response already.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/:name').pipe(
          tap(({req, res}) => {
            if (req.params.name === 'a') res.send('AAA');
          }),
          respond(() => 'BBB')
        ).subscribe();
        app.use(router.core);
      },
      (req, cleanup) => {
        Promise.all([req.get('/a'), req.get('/b')])
        .then(([a, b]) => {
          cleanup();
          a.text.should.equal('AAA');
          b.text.should.equal('BBB');
          done();
        });
      }
    )
  });

  it('should work with async functions.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(respond(() => new Promise(resolve => resolve('Hellow!')))).subscribe();
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.text.should.equal('Hellow!');
          done();
        });
      }
    )
  });

  it('should work with obsevables.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(respond(() => of('Hellow!').pipe(delay(10)))).subscribe();
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          res.text.should.equal('Hellow!');
          done();
        });
      }
    )
  });

  it('should catch errors.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(respond(({res}) => {
          res.sendStatus(500);
          throw Error();
        })).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(() => cleanup());
      }
    )
  });

  it('should catch async errors.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(respond(({res}) => new Promise((_, reject) => {
          res.sendStatus(500);
          reject(Error());
        }))).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(() => cleanup());
      }
    )
  });

  it('should catch observable errors.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(respond(({res}) => of(true).pipe(
          tap(() => res.sendStatus(500)),
          mergeMap(() => throwError(Error()))
        ))).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(() => cleanup());
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
          respond(() => '')
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
    endpoint.pipe(respond(() => '')).subscribe(undefined, undefined, () => done());
    (endpoint as any).complete();
  });
});


describe('json()', () => {
  it('should respond using given function.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(json(() => ({ msg: 'Hellow!' }))).subscribe();
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          JSON.parse(res.text).msg.should.equal('Hellow!');
          done();
        });
      }
    )
  });

  it('should only respond if there is no response already.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/:name').pipe(
          tap(({req, res}) => {
            if (req.params.name === 'a') res.json({msg: 'AAA'});
          }),
          json(() => ({msg: 'BBB'}))
        ).subscribe();
        app.use(router.core);
      },
      (req, cleanup) => {
        Promise.all([req.get('/a'), req.get('/b')])
        .then(([a, b]) => {
          cleanup();
          JSON.parse(a.text).msg.should.equal('AAA');
          JSON.parse(b.text).msg.should.equal('BBB');
          done();
        });
      }
    )
  });

  it('should work with async functions.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(json(() => new Promise(resolve => resolve({msg: 'Hellow!'})))).subscribe();
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          JSON.parse(res.text).msg.should.equal('Hellow!');
          done();
        });
      }
    )
  });

  it('should work with observables.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(json(() => of({ msg: 'Hellow!' }).pipe(delay(10)))).subscribe();
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(res => {
          cleanup();
          JSON.parse(res.text).msg.should.equal('Hellow!');
          done();
        });
      }
    )
  });

  it('should catch errors.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(json(({res}) => {
          res.sendStatus(500);
          throw Error();
        })).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(() => cleanup());
      }
    )
  });

  it('should catch async errors.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(json(({res}) => new Promise((_, reject) => {
          res.sendStatus(500);
          reject(Error());
        }))).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(() => cleanup());
      }
    )
  });

  it('should catch observable errors.', done => {
    test(
      app => {
        const router = new Router();
        router.get('/').pipe(json(({res}) => of(true).pipe(
          tap(() => res.sendStatus(500)),
          mergeMap(() => throwError(Error()))
        ))).subscribe(() => {}, () => done());
        app.use(router.core);
      },
      (req, cleanup) => {
        req.get('/').then(() => cleanup());
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
          json(() => '')
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
    endpoint.pipe(json(() => '')).subscribe(undefined, undefined, () => done());
    (endpoint as any).complete();
  });
});
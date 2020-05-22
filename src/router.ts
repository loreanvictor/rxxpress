import { Router as _Router, Request, Response, NextFunction } from 'express';
import { Subject, Observable } from 'rxjs';

import { Packet, Method, Req } from './types';


const C = (req: Request) => {
  (req as Req)._ = (req as Req)._ || {};
  return req as Req;
}


/**
 *
 * A `Router` can hook into different routes, creating
 * [`Observable`](https://rxjs-dev.firebaseapp.com/guide/observable)s for such routes.
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/router) for more info.
 *
 */
export class Router {
  private _internal: _Router = _Router();

  /**
   *
   * Creates and returns an [`Observable`](https://rxjs-dev.firebaseapp.com/guide/observable)
   * for stream of incoming requests on given route with given HTTP method.
   *
   * @param method the HTTP method to listen to. list of possible HTTP methods can be found
   *                [here](https://expressjs.com/en/5x/api.html#routing-methods). Additionally, its
   *                value can be set to `'all'`.
   * @param route the route to listen to. if not passed, `'*'` is used as default.
   * @returns an [`Obseervable`](https://rxjs-dev.firebaseapp.com/guide/observable) emitting incmoing
   *          [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets)s.
   *
   */
  public on(method: 'all' | Method, route?: string | RegExp): Observable<Packet> {
    const sub = new Subject<Packet>();
    const _handler = (req: Request, res: Response, next: NextFunction) => sub.next({req: C(req), res, next});

    if (route) this._internal[method].apply(this._internal, [route, _handler]);
    else this._internal[method].apply(this._internal, ['*', _handler]);
    return sub;
  }

  public all(route?: string | RegExp): Observable<Packet> { return this.on('all', route); }
  public checkout(route?: string | RegExp): Observable<Packet> { return this.on('checkout', route); }
  public copy(route?: string | RegExp): Observable<Packet> { return this.on('copy', route); }
  public delete(route?: string | RegExp): Observable<Packet> { return this.on('delete', route); }
  public get(route?: string | RegExp): Observable<Packet> { return this.on('get', route); }
  public head(route?: string | RegExp): Observable<Packet> { return this.on('head', route); }
  public lock(route?: string | RegExp): Observable<Packet> { return this.on('lock', route); }
  public merge(route?: string | RegExp): Observable<Packet> { return this.on('merge', route); }
  public mkactivity(route?: string | RegExp): Observable<Packet> { return this.on('mkactivity', route); }
  public mkcol(route?: string | RegExp): Observable<Packet> { return this.on('mkcol', route); }
  public move(route?: string | RegExp): Observable<Packet> { return this.on('move', route); }
  /* istanbul ignore next */
  public mSearch(route?: string | RegExp): Observable<Packet> { return this.on('m-search', route); }
  public notify(route?: string | RegExp): Observable<Packet> { return this.on('notify', route); }
  public options(route?: string | RegExp): Observable<Packet> { return this.on('options', route); }
  public patch(route?: string | RegExp): Observable<Packet> { return this.on('patch', route); }
  public post(route?: string | RegExp): Observable<Packet> { return this.on('post', route); }
  public purge(route?: string | RegExp): Observable<Packet> { return this.on('purge', route); }
  public put(route?: string | RegExp): Observable<Packet> { return this.on('put', route); }
  public report(route?: string | RegExp): Observable<Packet> { return this.on('report', route); }
  public search(route?: string | RegExp): Observable<Packet> { return this.on('search', route); }
  public subscribe(route?: string | RegExp): Observable<Packet> { return this.on('subscribe', route); }
  public trace(route?: string | RegExp): Observable<Packet> { return this.on('trace', route); }
  public unlock(route?: string | RegExp): Observable<Packet> { return this.on('unlock', route); }
  public unsubscribe(route?: string | RegExp): Observable<Packet> { return this.on('unsubscribe', route); }

  /**
   *
   * Will create and return an [`Observable`](https://rxjs-dev.firebaseapp.com/guide/observable)
   * that is mounted on given route as a middleware. This is useful for plugging in middleware
   * functionality or mounting other routers for handling sub-routes, specifically combined
   * with the [`use()`](https://loreanvictor.github.io/rxxpress/operators/use) oeprator.
   *
   * If the middleware observable is to delegate processing of a request to another observable / function,
   * it **MUST** invoke `next()` on the corresponding
   * [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets). This can also be done by piping
   * the observable to [`next()`](https://loreanvictor.github.io/rxxpress/operators/next) operator:
   *
   * ```ts
   * import { next, ... } from 'rxxpress';
   *
   * router.use('/some-path').pipe(
   *   ...
   *   next()
   * ).subscribe();
   * ```
   *
   * @param route the route to mount on. If no route is passed, the middleware observable will be
   *              mounted on all routes.
   * 
   * @returns an [`Observable`](https://rxjs-dev.firebaseapp.com/guide/observable) emitting incmoing
   *          [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets)s.
   *
   */
  public use(route?: string | RegExp): Observable<Packet> {
    const sub = new Subject<Packet>();
    const handler = (req: Request, res: Response, next: NextFunction) => sub.next({req: C(req), res, next});
    if (route) this._internal.use(route, handler);
    else this._internal.use(handler);
    return sub;
  }

  /**
   *
   * Represents the underlying [Express Router](https://expressjs.com/en/api.html#express.router).
   * Can be used to mount this router on Express applications and other Express routers:
   *
   * ```ts
   * app.use(router.core);
   * ```
   *
   */
  public get core(): _Router { return this._internal }
}

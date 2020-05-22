import { Router as _Router, Request, Response, NextFunction } from 'express';
import { Subject } from 'rxjs';

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
  private _internal = _Router();

  /**
   *
   * Creates and returns an [`Observable`](https://rxjs-dev.firebaseapp.com/guide/observable)
   * for stream of incoming requests on given route with given HTTP method.
   *
   * @param method the HTTP method to listen to. list of possible HTTP methods can be found 
   *                [here](https://expressjs.com/en/5x/api.html#routing-methods). Additionally, its
   *                value can be set to `'all'`.
   * @param route the route to listen to. if not passed, `'*'` is used as default.
   * @returns a [`Subject`](https://rxjs-dev.firebaseapp.com/guide/subject) emitting incmoing 
   *          [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets)s.
   *
   */
  on(method: 'all' | Method, route?: string | RegExp) {
    const sub = new Subject<Packet>();
    const _handler = (req: Request, res: Response, next: NextFunction) => sub.next({req: C(req), res, next});

    if (route) this._internal[method].apply(this._internal, [route, _handler]);
    else this._internal[method].apply(this._internal, ['*', _handler]);
    return sub;
  }

  all(route?: string | RegExp) { return this.on('all', route); }
  checkout(route?: string | RegExp) { return this.on('checkout', route); }
  copy(route?: string | RegExp) { return this.on('copy', route); }
  delete(route?: string | RegExp) { return this.on('delete', route); }
  get(route?: string | RegExp) { return this.on('get', route); }
  head(route?: string | RegExp) { return this.on('head', route); }
  lock(route?: string | RegExp) { return this.on('lock', route); }
  merge(route?: string | RegExp) { return this.on('merge', route); }
  mkactivity(route?: string | RegExp) { return this.on('mkactivity', route); }
  mkcol(route?: string | RegExp) { return this.on('mkcol', route); }
  move(route?: string | RegExp) { return this.on('move', route); }
  /* istanbul ignore next */mSearch(route?: string | RegExp) { return this.on('m-search', route); }
  notify(route?: string | RegExp) { return this.on('notify', route); }
  options(route?: string | RegExp) { return this.on('options', route); }
  patch(route?: string | RegExp) { return this.on('patch', route); }
  post(route?: string | RegExp) { return this.on('post', route); }
  purge(route?: string | RegExp) { return this.on('purge', route); }
  put(route?: string | RegExp) { return this.on('put', route); }
  report(route?: string | RegExp) { return this.on('report', route); }
  search(route?: string | RegExp) { return this.on('search', route); }
  subscribe(route?: string | RegExp) { return this.on('subscribe', route); }
  trace(route?: string | RegExp) { return this.on('trace', route); }
  unlock(route?: string | RegExp) { return this.on('unlock', route); }
  unsubscribe(route?: string | RegExp) { return this.on('unsubscribe', route); }

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
   * @returns a [`Subject`](https://rxjs-dev.firebaseapp.com/guide/subject) emitting incmoing 
   *          [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets)s.
   *
   */
  use(route?: string | RegExp) {
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
  get core() { return this._internal }
}

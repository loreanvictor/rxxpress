import { Router as _Router, Request, Response, NextFunction } from 'express';
import { Subject } from 'rxjs';

import { Packet, Method, Req } from './types';


const C = (req: Request) => {
  (req as Req)._ = (req as Req)._ || {};
  return req as Req;
}


export class Router {
  private _internal = _Router();

  on(method: 'all' | Method, route?: string | RegExp) {
    const sub = new Subject<Packet>();
    const _handler = (req: Request, res: Response, next: NextFunction) => sub.next({req: C(req), res, next});

    if (route) this._internal[method].apply(this._internal, [route, _handler]);
    else this._internal[method].apply(this._internal, [_handler]);
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
  mSearch(route?: string | RegExp) { return this.on('m-search', route); }
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

  use(route?: string | RegExp) {
    const sub = new Subject<Packet>();
    const handler = (req: Request, res: Response, next: NextFunction) => sub.next({req: C(req), res, next});
    if (route) this._internal.use(route, handler);
    else this._internal.use(handler);
    return sub;
  }

  get core() { return this._internal }
}

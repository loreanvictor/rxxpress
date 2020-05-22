import { Router as _Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { Observable, OperatorFunction } from 'rxjs';

import { Router } from './router';
import { Packet } from './types';


function _handler(og: Router | _Router | RequestHandler): RequestHandler {
  if (og instanceof Router) return _handler(og.core);
  return (req: Request, res: Response, next: NextFunction) => og(req, res, next);
}


/**
 *
 * Allows piping the custom request handler to a [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets)
 * emitting observable (such as `router.get('/')` or `router.use()`).
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/use) for more information.
 *
 * @param handler the request handler. **MUST** be either a [`Router`](https://loreanvictor.github.io/rxxpress/router),
 *                an [Express Router](https://expressjs.com/en/api.html#express.router) or a request handler
 *                function (`(req, res, next) => ...`)
 *
 */
export function use(handler: Router | _Router | RequestHandler): OperatorFunction<Packet, Packet> {
  const _handle = _handler(handler);
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(async packet => {
          try {
            await _handle(packet.req, packet.res, (err: unknown) => {
              if (err) observer.error(err);
              else observer.next(packet)
            })
          } catch(err) {
            observer.error(err);
          }
        },
        error => observer.error(error),
        () => observer.complete(),
      );
    });
  }
}

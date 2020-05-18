import { Router as _Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs';

import { Router } from './router';
import { Packet } from './types';


function _isExpressRouter(handler: _Router | RequestHandler): handler is _Router {
  return (handler as any).handle && (typeof (handler as any).handle === 'function');
}


function _handler(og: Router | _Router | RequestHandler): RequestHandler {
  if (og instanceof Router) return _handler(og.core);
  if (_isExpressRouter(og))
    return (req: Request, res: Response, next: NextFunction) => og(req, res, next);
  return og;
}


export function use(handler: Router | _Router | RequestHandler) {
  const _handle = _handler(handler);
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(async packet => {
          try {
            await _handle(packet.req, packet.res, (err: any) => {
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

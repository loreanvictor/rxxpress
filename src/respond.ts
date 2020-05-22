import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { Packet } from './types';


/**
 *
 * Represents a response function, which creates a response for
 * incoming packets. Can return a value,
 * a promise or an observable.
 *
 */
export type RepsonseFunc = (packet: Packet) => any;

/**
 *
 * Responds to incoming requests using given response function, if
 * the request is not already responded to.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/respond) for more information.
 *
 * @param response the response function to use
 *
 */
export function respond(response: RepsonseFunc) {
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(async packet => {
        if (!packet.res.headersSent) {
          try {
            const _res = await response(packet);
            if (_res instanceof Observable)
              _res.pipe(first())
              .subscribe(
                r => packet.res.send(r),
                err => observer.error(err)
              );
            else packet.res.send(_res);
          } catch(err) {
            observer.error(err);
          }
        }
      },
      error => observer.error(error),
      () => observer.complete());
    });
  }
}

/**
 *
 * Responds to incoming requests using given response function, sending
 * JSON objects as response if the request is not already responded to.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/respond) for more information.
 *
 * @param response the response function to use
 *
 */
export function json(response: RepsonseFunc) {
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(async packet => {
        if (!packet.res.headersSent) {
          try {
            const _res = await response(packet);
            if (_res instanceof Observable)
              _res.pipe(first()).subscribe(
                r => packet.res.json(r),
                err => observer.error(err)
              );
            else packet.res.json(_res);
          } catch(err) {
            observer.error(err);
          }
        }
      },
      error => observer.error(error),
      () => observer.complete())
    });
  }
}

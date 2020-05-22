import { Observable } from 'rxjs';

import { Packet } from './types';


/**
 *
 * Will pass the incoming request to next matching request handler. This will
 * also stop emission of the [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets)
 * down the observable sequence.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/next) for more information.
 *
 * @param safe If `true`, will only pass to next handler IF the request is not already responded
 *             to. If `false`, will pass all requests to next handler. Default is `true`.
 *
 */
export function next(safe=true) {
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(
        packet => {
          if (safe) {
            if (!packet.res.headersSent) packet.next();
          } else packet.next();
        },
        err => observer.error(err),
        () => observer.complete()
      );
    });
  }
}

import { Observable, OperatorFunction } from 'rxjs';

import { Packet } from './types';
import { first } from 'rxjs/operators';


/**
 *
 * Denotes a wait function, which does something (possible asynchronously)
 * in response to an incoming packet.
 *
 */
export type Wait = (packet: Packet) => any | Promise<any> | Observable<any>;


/**
 *
 * Will execute the given wait function on incoming 
 * [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets)s.
 * When finished, will pass the packet down the observable sequence.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/wait) for more information.
 *
 * @param _wait the wait function to use.
 *
 */
export function wait(_wait: Wait): OperatorFunction<Packet, Packet> {
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(
        async packet => {
          try {
            const _res = await _wait(packet);
            if (_res instanceof Observable) {
              _res.pipe(first()).subscribe(
                () => observer.next(packet),
                err => observer.error(err),
              )
            } else {
              observer.next(packet);
            }
          } catch (err) {
            observer.error(err);
          }
        },
        err => observer.error(err),
        () => observer.complete()
      );
    });
  }
}

import { Observable, merge } from 'rxjs';
import { map, tap, share, filter } from 'rxjs/operators';
import { Packet } from './types';


/**
 *
 * Valid options for [`join()`](https://loreanvictor.github.io/rxxpress/operators/join)
 * operator
 *
 */
export interface JoinOptions {
  /**
   *
   * Denotes whether `join()` should run in safe mode or not. In safe mode,
   * requests that are responded to are ignored. While turned off, those requests
   * will also be passed down the observable sequence.
   *
   * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/join#safety) for more information.
   *
   */
  safe?: boolean;
}


type StackEntry = { flag: boolean[] };
type StackType = {[id: string]: StackEntry };


/**
 *
 * When all given observables emit the same packet, will emit that packet.
 * Can be used to conduct simultaenous checks / actions on incoming packets.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/join) for more information.
 *
 */
export function join(): (...obs: Observable<Packet>[]) => Observable<Packet>;
export function join(...obs: Observable<Packet>[]): Observable<Packet>;
export function join(options?: JoinOptions): (...obs: Observable<Packet>[]) => Observable<Packet>;
export function join(options?: JoinOptions, ...obs: Observable<Packet>[]): Observable<Packet>;

export function join(options?: JoinOptions | Observable<Packet>, ...obs: Observable<Packet>[]) {
  if (options instanceof Observable) {
    return join({}, ...[options, ...obs]);
  } else {
    if (obs.length === 0) {
      return (...obs: Observable<Packet>[]) => join(options, ...obs);
    }

    const stack: StackType = {};

    return merge(...obs.map(
      (src, index) => src.pipe(
        tap(({req}) => {
          if (!req._.__req_uid) {
            req._.__req_uid = Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15);
          }
        }),
        map(packet => ({packet, index})),
      )
    )).pipe(
      filter(({packet, index}) => {
        if (options?.safe !== false && packet.res.headersSent)
          return false;

        let entry: StackEntry;
        if (!(packet.req._.__req_uid in stack)) {
          entry = stack[packet.req._.__req_uid] = {flag: obs.map(() => false)};

          if (options?.safe !== false)
            packet.res.on('finish', () => delete stack[packet.req._.__req_uid]);
        } else entry = stack[packet.req._.__req_uid];

        entry.flag[index] = true;
        return entry.flag.every(_ => _);
      }),
      map(({packet}) => packet),
      tap(packet => delete stack[packet.req._.__req_uid]),
      share(),
    );
  }
}

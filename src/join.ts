import { Observable, merge } from 'rxjs';
import { map, tap, share, filter } from 'rxjs/operators';
import { Packet } from './types';


export interface JoinOptions {
  safe?: boolean;
}


type StackEntry = { flag: boolean[] };
type StackType = {[id: string]: StackEntry };


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

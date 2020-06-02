import { Observable, OperatorFunction } from 'rxjs';

import { Packet } from './types';
import { first } from 'rxjs/operators';


export type Wait = (packet: Packet) => any | Promise<any> | Observable<any>;


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

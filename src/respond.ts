import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { Packet } from './types';


export type RepsonseFunc = (packet: Packet) => any;

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

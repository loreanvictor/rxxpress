import { Observable } from 'rxjs';

import { Packet } from './types';


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

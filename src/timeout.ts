import { Observable } from 'rxjs';
import { RequestTimeout } from 'http-errors';

import { Packet } from './types';


export function timeout(milisseconds: number, safe=false) {
  return(source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(
        packet => {
          observer.next(packet);
          setTimeout(() => {
            if (!packet.res.headersSent) {
              packet.res.status(408).send();
              if (!safe) observer.error(new RequestTimeout());
            }
          }, milisseconds);
        },
        err => observer.error(err),
        () => observer.complete(),
      )
    });
  }
}

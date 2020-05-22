import { Observable, OperatorFunction } from 'rxjs';
import { RequestTimeout } from 'http-errors';

import { Packet, Status } from './types';


/**
 *
 * Will emit incoming requests down the observable sequence. However, if
 * after specified timespan the request is not repsonded to, will respond to it
 * using a _Request Timeout_ (408) status, and will throw an error if parameter
 * `safe` is not set to `true`.
 *
 * @param milisseconds the time to wait before checking status of the request.
 * @param safe         if `true`, will not throw an error on timeout. otherwise will throw an error on timeout.
 *
 */
export function timeout(milisseconds: number, safe:boolean=true): OperatorFunction<Packet, Packet> {
  return(source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(
        packet => {
          observer.next(packet);
          setTimeout(() => {
            if (!packet.res.headersSent) {
              packet.res.status(Status.RequestTimeout).send();
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

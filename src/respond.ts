import { Observable } from 'rxjs';

import { Packet } from './types';


export type RepsonseFunc = (packet: Packet) => any;

export function respond(response: RepsonseFunc, safe=true) {
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(packet => {
        if (!packet.res.headersSent || !safe) {
          packet.res.send(response(packet));
        }
      },
      error => observer.error(error),
      () => observer.complete());
    });
  }
}

export function json(response: RepsonseFunc, safe=true) {
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(packet => {
        if (!packet.res.headersSent || !safe) {
          packet.res.json(response(packet));
        }
      },
      error => observer.error(error),
      () => observer.complete())
    });
  }
}

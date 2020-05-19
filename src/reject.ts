import { Observable } from 'rxjs';

import { Packet } from './types';


export function reject(status: number, message: string = '') {
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(packet => {
        if (!packet.res.headersSent) {
          packet.res.status(status).send(message);
        }
      },
      error => observer.error(error),
      () => observer.complete());
    });
  }
}


export function badrequest(message: string = '') { return reject(400, message); }
export function unauthorized(message: string = '') { return reject(401, message); }
export function forbidden(message: string = '') { return reject(403, message); }
export function notfound(message: string = '') { return reject(404, message); }

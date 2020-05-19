import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { Packet } from './types';


export type Check = (packet: Packet) => boolean | Promise<boolean> | Observable<boolean>;

export interface CheckOptions {
  status: number;
  message: string;
}

export function check(_check: Check, options: Partial<CheckOptions> = {}) {
  const opts: CheckOptions = {
    status: options.status ?? 500,
    message: options.message ?? '',
  }
 
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(
        async packet => {
          try {
            const _res = await _check(packet);
            if (typeof _res === 'boolean') {
              if (_res) observer.next(packet);
              else packet.res.status(opts.status).send(opts.message);
            }
            else {
              _res.pipe(first()).subscribe(
                pass => {
                  if (pass) observer.next(packet);
                  else packet.res.status(opts.status).send(opts.message);
                },
                err => observer.error(err)
              );
            }
          } catch(err) {
            observer.error(err);
          }
        },
        err => observer.error(err),
        () => observer.complete(),
      );
    });
  }
}



export function validate(c: Check, message: string = '') {
  return check(c, { message, status: 400 });
}

export function authorize(c: Check, message: string = '') {
  return check(c, { message, status: 401 });
}

export function allow(c: Check, message: string = '') {
  return check(c, { message, status: 403 });
}

export function find(c: Check, message: string = '') {
  return check(c, { message, status: 404 });
}

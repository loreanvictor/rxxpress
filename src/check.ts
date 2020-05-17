import { Observable } from 'rxjs';
import createError, { BadRequest } from 'http-errors';

import { Packet } from './types';


export type Check = (packet: Packet) => Observable<boolean>;

export interface CheckOptions {
  status: number;
  message: string;
  safe: boolean;
  err: () => Error;
}

export function check(_check: Check, options: Partial<CheckOptions> = {}) {
  const opts: CheckOptions = {
    status: options.status ?? 500,
    message: options.message ?? '',
    safe: options.safe ?? true,
    err: () => createError(opts.status, opts.message),
  }
 
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(
        packet => {
          const sub = _check(packet).subscribe(pass => {
            if (pass) {
              observer.next(packet);
            } else {
              packet.res.status(opts.status).send(opts.message);
              if (!opts.safe)
                observer.error(opts.err());
            }
            sub.unsubscribe();
          });
        },
        err => observer.error(err),
        () => observer.complete(),
      );
    });
  }
}


export interface PresetCheckOptions {
  message: string;
  safe: boolean;
}

export function validate(c: Check, options: Partial<PresetCheckOptions> = {}) {
  return check(c, { ...options, status: 400, err: () => new BadRequest(options.message || '')});
}

export function permit(c: Check, options: Partial<PresetCheckOptions> = {}) {
  return check(c, { ...options, status: 403, err: () => new BadRequest(options.message || '')});
}

export function ifexists(c: Check, options: Partial<PresetCheckOptions> = {}) {
  return check(c, { ...options, status: 404, err: () => new BadRequest(options.message || '')});
}

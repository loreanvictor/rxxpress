import { Observable, OperatorFunction } from 'rxjs';
import { first } from 'rxjs/operators';

import { Packet, Status } from './types';


/**
 *
 * Represents a check function, which checks something for each incoming
 * packet. Should return a `boolean`, a promise of a `boolean` or an observable
 * of a `boolean`.
 *
 */
export type Check = (packet: Packet) => boolean | Promise<boolean> | Observable<boolean>;

/**
 *
 * Valid options for [`check()`](https://loreanvictor.github.io/rxxpress/operators/check)
 * operator.
 *
 */
export interface CheckOptions {
  /**
   *
   * The status of the response if the check fails.
   *
   */
  status: number;

  /**
   *
   * The response message if the check fails.
   *
   */
  message: string;
}

/**
 *
 * Will check incoming requests using given check function. If the check fails,
 * will respond with a status and message (according to given options). If it passes,
 * emits the [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets) down
 * the observable sequence.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/check) for more information.
 *
 * @param _check   the check function to use.
 * @param options  check options (status and message).
 *
 */
export function check(_check: Check, options: Partial<CheckOptions> = {}): OperatorFunction<Packet, Packet> {
  const opts: CheckOptions = {
    status: options.status ?? Status.InternalError,
    message: options.message ?? '',
  }

  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      return source.subscribe(
        async packet => {
          if (packet.res.headersSent) return;

          try {
            const _res = await _check(packet);

            if (packet.res.headersSent) return;

            if (typeof _res === 'boolean') {
              if (_res) observer.next(packet);
              else packet.res.status(opts.status).send(opts.message);
            }
            else {
              _res.pipe(first()).subscribe(
                pass => {
                  if (packet.res.headersSent) return;
                  if (pass) observer.next(packet);
                  else packet.res.status(opts.status).send(opts.message);
                },
                err => observer.error(err),
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


/**
 *
 * Checks incoming requests using given check function. If the check fails,
 * will respond with _Bad Request_ (400) status and given message, otherwise
 * emits the [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets) down
 * the observable sequence.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/check#aliases) for more information.
 *
 * @param c         the check function
 * @param message   the message to be sent if the check fails.
 *
 */
export function validate(c: Check, message: string = ''): OperatorFunction<Packet, Packet> {
  return check(c, { message, status: Status.BadRequest });
}

/**
 *
 * Checks incoming requests using given check function. If the check fails,
 * will respond with _Unauthorized_ (401) status and given message, otherwise
 * emits the [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets) down
 * the observable sequence.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/check#aliases) for more information.
 *
 * @param c         the check function
 * @param message   the message to be sent if the check fails.
 *
 */
export function authorize(c: Check, message: string = ''): OperatorFunction<Packet, Packet> {
  return check(c, { message, status: Status.Unauthorized });
}

/**
 *
 * Checks incoming requests using given check function. If the check fails,
 * will respond with _Forbidden_ (403) status and given message, otherwise
 * emits the [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets) down
 * the observable sequence.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/check#aliases) for more information.
 *
 * @param c         the check function
 * @param message   the message to be sent if the check fails.
 *
 */
export function allow(c: Check, message: string = ''): OperatorFunction<Packet, Packet> {
  return check(c, { message, status: Status.Forbidden });
}

/**
 *
 * Checks incoming requests using given check function. If the check fails,
 * will respond with _Not Found_ (404) status and given message, otherwise
 * emits the [`Packet`](https://loreanvictor.github.io/rxxpress/router#packets) down
 * the observable sequence.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/check#aliases) for more information.
 *
 * @param c         the check function
 * @param message   the message to be sent if the check fails.
 *
 */
export function find(c: Check, message: string = ''): OperatorFunction<Packet, Packet> {
  return check(c, { message, status: Status.NotFound });
}

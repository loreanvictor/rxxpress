import { Observable } from 'rxjs';

import { Packet } from './types';


/**
 *
 * Will respond to incoming requests with given status and message,
 * if they are not already responded to.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/reject) for more information.
 *
 * @param status   the HTTP status code to be used.
 * @param message  the text message to be sent.
 *
 */
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


/**
 *
 * Will respond to incoming requests with a _Bad Request_ (400) status and given message,
 * if they are not already responded to.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/reject#aliases) for more information.
 *
 * @param status   the HTTP status code to be used.
 * @param message  the text message to be sent.
 *
 */
export function badrequest(message: string = '') { return reject(400, message); }

/**
 *
 * Will respond to incoming requests with a _Unauthorized_ (401) status and given message,
 * if they are not already responded to.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/reject#aliases) for more information.
 *
 * @param status   the HTTP status code to be used.
 * @param message  the text message to be sent.
 *
 */
export function unauthorized(message: string = '') { return reject(401, message); }

/**
 *
 * Will respond to incoming requests with a _Forbidden (403) status and given message,
 * if they are not already responded to.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/reject#aliases) for more information.
 *
 * @param status   the HTTP status code to be used.
 * @param message  the text message to be sent.
 *
 */
export function forbidden(message: string = '') { return reject(403, message); }

/**
 *
 * Will respond to incoming requests with a _Not Found_ (404) status and given message,
 * if they are not already responded to.
 *
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/operators/reject#aliases) for more information.
 *
 * @param status   the HTTP status code to be used.
 * @param message  the text message to be sent.
 *
 */
export function notfound(message: string = '') { return reject(404, message); }

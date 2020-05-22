import { Request, Response, NextFunction } from 'express';


/**
 *
 * Represents a standard Express request object, augmented with
 * a liniently typed `_` property that allows easily attaching
 * custom data to the request while maintaining type safety:
 *
 * ```ts
 * req.user = ...   // --> ERROR: Request object does not have any property named `user`
 * req._.user = ... // --> cool with typechecking
 * ```
 *
 */
export type Req = Request & { _: {[key: string]: any} };

/**
 *
 * Represents an incoming request.
 * @see [the official docs](https://loreanvictor.github.io/rxxpress/router#packets) for
 * more information.
 *
 */
export interface Packet {
  /**
   *
   * Denotes the request object.
   *
   */
  req: Req,

  /**
   *
   * Denotes the response object, can be used to respond to the request.
   *
   */
  res: Response,

  /**
   *
   * When invoked, will signal Express that handling this request should
   * be delegated to next matching handler.
   *
   */
  next: NextFunction,
}


/**
 *
 * Represents all supported HTTP methods.
 * @see [this entry](https://expressjs.com/en/5x/api.html#routing-methods) for more information.
 *
 */
export type Method = 'checkout' | 'copy'       | 'delete' | 'get'    | 'head'     | 'lock' 
                   | 'merge'    | 'mkactivity' | 'mkcol'  | 'move'   | 'm-search' | 'notify'
                   | 'options'  | 'patch'      | 'post'   | 'purge'  | 'put'      | 'report'
                   | 'search'   | 'subscribe'  | 'trace'  | 'unlock' | 'unsubscribe';
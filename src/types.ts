import { Request, Response, NextFunction } from 'express';


export type Req = Request & { _: {[key: string]: any} };

export interface Packet {
  req: Req,
  res: Response,
  next: NextFunction,
}


export type Method = 'checkout' | 'copy'       | 'delete' | 'get'    | 'head'     | 'lock' 
                   | 'merge'    | 'mkactivity' | 'mkcol'  | 'move'   | 'm-search' | 'notify'
                   | 'options'  | 'patch'      | 'post'   | 'purge'  | 'put'      | 'report'
                   | 'search'   | 'subscribe'  | 'trace'  | 'unlock' | 'unsubscribe';
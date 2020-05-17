import { Request, Response, NextFunction } from 'express';


export interface Packet {
  req: Request,
  res: Response,
  next: NextFunction,
}


export type Method = 'checkout' | 'copy'       | 'delete' | 'get'    | 'head'     | 'lock' 
                   | 'merge'    | 'mkactivity' | 'mkcol'  | 'move'   | 'm-search' | 'notify'
                   | 'options'  | 'patch'      | 'post'   | 'purge'  | 'put'      | 'report'
                   | 'search'   | 'subscribe'  | 'trace'  | 'unlock' | 'unsubscribe';
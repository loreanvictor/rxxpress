import express, { Application } from 'express';
import chai, { should } from 'chai'; should();
import http from 'chai-http';import { Router } from '../router';
 chai.use(http);


export type PrepFunc = (app: Application) => void;
export type TestFunc = (req: ChaiHttp.Agent, cleanup: () => void) => void;

export function testWithApp(prepare: PrepFunc, test: TestFunc) {
  const app = express();
  prepare(app);
  const server = app.listen(3000, () => {
    test(chai.request(app), () => server.close());
  });
}


export type RouterPrepFunc = (router: Router) => void;

export function testWithRouter(prepare: RouterPrepFunc, test: TestFunc) {
  return testWithApp(app => {
    const router = new Router();
    prepare(router);
    app.use(router.core);
  }, test);
}

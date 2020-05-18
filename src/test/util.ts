import express, { Application } from 'express';
import chai, { should, expect } from 'chai'; should();
import http from 'chai-http'; chai.use(http);


export type PrepFunc = (app: Application) => void;
export type TestFunc = (req: ChaiHttp.Agent, cleanup: () => void) => void;

export function test(prepare: PrepFunc, test: TestFunc) {
  const app = express();
  prepare(app);
  const server = app.listen(3000, () => {
    test(chai.request(app), () => server.close());
  });
}

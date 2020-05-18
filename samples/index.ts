import express from 'express';
import { zip, from, of } from 'rxjs';
import { filter, retry, tap, mapTo, catchError, debounceTime, mergeMap, groupBy } from 'rxjs/operators';

import { Router, timeout, json, validate, ifexists, permit } from '../src';


const router = new Router();
const endpoint = router.get('/').pipe(timeout(1000));

zip(
  endpoint.pipe(filter(({req}) => req.query.token === 'ALICE')),
  endpoint.pipe(filter(({req}) => req.query.token === 'BOB')),
)
.pipe(
  tap(([{res: alice}, {res: bob}]) => {
    alice.send('DONE IT!');
    bob.send('YEP!');
  }),
  retry()
)
.subscribe();

const app = express();
app.listen(3000);
app.use(router.core);
app.use((_, res) => res.status(400).send('NOT FOUND!'));



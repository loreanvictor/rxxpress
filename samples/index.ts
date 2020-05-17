import express, { Router as _Router } from 'express';
import bodyparser from 'body-parser';
import { debounceTime, groupBy, mergeMap } from 'rxjs/operators';

import { Router } from '../src/router';
import { use } from '../src/use';


const sub = new Router();
sub.get('/world').subscribe(({res}) => res.status(200).send('HALO WELT!'));

const _s2 = _Router();
_s2.get('/X', (_, res) => res.status(200).send('Hi X!'));

const router = new Router();

router.use('/hello')
  .pipe(
    use(bodyparser()),
    groupBy(({req}) => req.query.name),
    mergeMap(group => group.pipe(debounceTime(5000))),
    use(sub),
    use(_s2),
  )
  .subscribe(({req, res}) => res.status(200).send(`Hellow ${req.query.name}`));

const app = express();
app.use(router.core);
app.use((_, res) => res.status(400).send('NOT FOUND!'));
app.listen(3000);

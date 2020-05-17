# RxXpress

An experimental mash-up of [**RxJS**](https://rxjs-dev.firebaseapp.com) and [**Express**](https://expressjs.com).
```
npm i rxxpress
```

The core of **RxXpress** is the `Router` class, which behaves like 
[**Express**'s `Router`](http://expressjs.com/en/5x/api.html#router), except that instead of accepting a callback,
it returns a [`Subject`](https://rxjs-dev.firebaseapp.com/guide/subject):

```ts
// router.ts
import { Router } from 'rxxpress';

const router = new Router();
router.get('/').subscribe(({res}) => res.send('Hellow World!'));
```
```ts
// index.ts
import * as express from 'express';
import router from './router';

const app = express();
app.use(router.core);
app.listen(3000);
```
[► TRY IT!](https://codesandbox.io/s/rxxpress-hellow-world-qi85k?file=/src/router.ts)

As you can see in this example, you can use **RxXpress** routers inside **Express** routers.

You can also use the `use()` operator to pipe **RxXpress** routers together:

```ts
// sub-router.ts
import { Router } from 'rxxpress';

const router = new Router();
router.get('/world').subscribe(({res}) => res.send('Halo Welt!'));
router.get('/dude').subscribe(({res}) => res.send('Hello My Dude!'));
router.get('/:name').subscribe(({req, res}) => res.send(`Hi ${req.params.name}`));

export default router;
```
```ts
// router.ts
import { Router, use } from 'rxxpress';
import subRouter from './sub-router';

const router = new Router();
router.use('/hello')
  .pipe(use(subRouter))
  .subscribe();

export default router;
```
[► TRY IT!](https://codesandbox.io/s/rxxpress-sub-router-w9x60?file=/src/router.ts)

The `use()` operator also allows piping **Express** routers, middlewares and request handlers to **RxXpress** routers:

```ts
// ...

import { Router as _Router } from 'express';
import * as bodyparser from 'body-parser';

// ...

const xpRouter = _Router();
xpRouter.get('/X', (req, res, next) => ...);

// ...

router.use('/')
  .pipe(
    use(xpRouter),
    use(bodyparser()),
    use((req, res, next) => ...),
  )
  .subscribe();
```

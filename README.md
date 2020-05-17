# RxXpress

An experimental mash-up of [**RxJS**](https://rxjs-dev.firebaseapp.com) and [**Express**](https://expressjs.com).
```
npm i rxxpress
```

<br>

The core of **RxXpress** is the `Router` class, which behaves like 
[**Express**'s `Router`](http://expressjs.com/en/5x/api.html#router), except that instead of accepting a callback,
it returns a [`Subject`](https://rxjs-dev.firebaseapp.com/guide/subject):

```ts
// router.ts
import { Router, respond } from 'rxxpress';

const router = new Router();
router.get('/').pipe(respond(() => 'Hellow World!')).subscribe();
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

<br><br>

# WHY?

Well I have _ABSOLUTELY NO IDEA_ where this is going to be really useful. My intention was to be able to do 
weird stuff. For example, you can use it to do rate limiting on a particular endpoint:

```ts
import { Router, respond } from 'rxxpress';
import { debounceTime } from 'rxjs/operators';


const router = new Router();

router.get('/endpoint')
  .pipe(
    debounceTime(1000),                // --> only respond to one request each second
    respond(() => 'Halo!')
  )
  .subscribe();
```

Or you can do rate limiting per end-point per user:

```ts
import { Router, respond } from 'rxxpress';
import { groupBy, mergeMap, debounceTime } from 'rxjs/operators';


const router = new Router();

router.get('/endpoint')
  .pipe(
    use(authenticate),                                 // --> some authentication method, populates `user_id`
    groupBy(({req}) => req.user_id),                   // --> group incoming requests by `user_id`
    mergeMap(group => group.pipe(debounceTime(1000))), // --> respond once per second per group
    respond(() => 'Halo!')
  )
  .subscribe();
```

<br>

You can even do weirder stuff like responding to an endpoint only if two users with different keys
request it at the same time:

```ts
import { Router, timeout } from 'rxxpress';
import { zip } from 'rxjs';
import { filter, retry, tap } from 'rxjs/operators';


const router = new Router();
const endpoint = router.get('/endpoint');

zip(
  endpoint.pipe(timeout(1000), filter(({req}) => req.query.key === ALICE_KEY)),  // --> Give'em a 1 sec window
  endpoint.pipe(timeout(1000), filter(({req}) => req.query.key === BOB_KEY)),    // --> Give'em a 1 sec window
)
.pipe(
  tap(([alice, bob]) => {
    if (alice.res.headerSent || bob.res.headerSent) throw Error();

    alice.res.send('You guys made it!');
    bob.res.send('You guys made it!');
  }),
  retry()
)
.subscribe();
```

<br><br>

# Interoperability

You can use **RxXpress** routers inside **Express** routers (check the first example). 
**RxXpress** also provides the `use()` pipeable operator, which provides seamless interoperability
with **Express**:

- You can use it to pipe **Express** routers to **RxXpress** routers.

- You can use it to pipe **Express** middlewares to **RxXpress** routers.

- You can use it to pipe any request handler function `(req, res, next) => ...` to **RxXpress** routers.

- You can use it to pipe **RxXpress** routers together.

<br>

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
Now checkout `/hello/world`, `/hello/dude` and `/hello/<whatever>` routers. \
[► TRY IT!](https://codesandbox.io/s/rxxpress-sub-router-w9x60?file=/src/router.ts)

<br>

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

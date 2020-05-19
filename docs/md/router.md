# Router

The `Router` class allows you to create end-point observables:

```ts
import { Router } from 'rxxpress';

const router = new Router();
/*!*/router.get('/').pipe(...).subscribe();            // --> define a `GET` endpoint on '/'
/*!*/router.put('/').pipe(...).subscribe();            // --> define a `PUT` endpoint on '/'

/*!*/router.get('/stuff').pipe(...).subscribe();       // --> define a `GET` endpoint on '/stuff'
/*!*/router.post('/stuff').pipe(...).subscribe();      // --> define a `POST` endpoint on '/stuff'
/*!*/router.delete('/stuff').pipe(...).subscribe();    // --> define a `DELETE` endpoint on '/stuff'

export default router;
```

You can then _use_ router instances on **Express** apps and routers:

```ts
import * as express from 'express';
import router from './router';

const app = express();
/*!*/app.use(router.core);                             // --> DO NOT FORGET THE .core
app.listen();
```

---

## Packets

Each route observable emits objects of type `Packet`:

```ts | --no-wmbar
export interface Packet {
  req: Request,              // --> the incoming request object, same as in Express
  res: Response,             // --> the outgoing response object, same as in Express
  next: NextFunction         // --> the next callback (basically indicating you don't want to handle this and want the next guy to take over).
}
```

```ts
router.get('/say-hi/:name').subscribe(
  ({req, res, next}) => {
    if (req.params.name === 'dude') res.send('Hellow Dude!');
    else next();
  }
);
```

The `req`, `res` and `next` properties are exactly the same `(req, res, next) => ...` parameters
you would get with any **Express** request handler.

---

## Http Methods

Similar to **Express** routers, you can invoke `router.<METHOD>(<path>)` on `Router` instances 
to get an endpoint with the corresponding HTTP verb:

```ts
router.get('/').pipe(respond(() => 'Hellow!')).subscribe();
router.post('/stuff').subscribe(({req, res}) => ...);
```

**RxXpress** supports the [same list of HTTP methods as **Express**](https://expressjs.com/en/5x/api.html#routing-methods).

Additionally, you can also use `router.all(<path>)` to match all HTTP verbs on given path.

```js
router.all('/api/*').pipe(                            /* --> for all api endpoints */
  authenticate(),                                     /* --> authenticate */
  groupBy(({req}) => req._.user.id),                  /* --> rate limit per user */
  mergeMap(group => group.pipe(debounceTime(1000))),  /* --> rate limit per user */
  next()                                              /* --> pass to the next handler */
).subscribe();
```

---

## Middlewares and Sub-routers

Similar to **Express** routers, you can use `.use()` method to mount middlewares and 
sub-routers on a `Router` instance. This is particularly useful in combination with
the `use()` operator:

```ts
import { Router, use, notfound } from 'rxxpress';
import * as bodyParser from 'body-parser';

import subRouter from './sub-router';

const router = new Router();

router.use('/users').pipe(
  use(bodyParser),                       // --> use famouse body-parser middleware
  use(subRouter),                        // --> can be an Express router or an RxXpress router
  notfound()                             // --> well if no sub-router responded, then its 404
).subscribe();
```

> :Buttons
> > :Button label=Read More About use(), url=/operators/use

---

## Attaching to Request

It is common practice in **Express** code to attach custom data to request object:

```ts
function authenticate(req, res, next) {
  // do stuff
/*!*/  req.user = user;      // --> so all subsequent handlers will have access to request's user object.
  next();
}
```

This however does not sit well with TypeScript in general, and in case of **RxXpress** forces
you to either give up the type-inference by annotating `req` as `any`, or casting it to `any`
everytime you want to attach data or fetch attached data.

Since these solutions are neither elegant nor convenient, **RxXpress** router simply adds a `_`
key to `req` on each packet it emits, which is a liniently typed object specifically for
attaching custom data:

```ts
router.all('*').pipe(
  tap(({req}) => {
    // do stuff
/*!*/    req._.user = user;     // --> attach user now without messing with type inference
  })
).subscribe();
```

> :ToCPrevNext
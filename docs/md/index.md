> :DarkLight
> > :InDark
> >
> > ![banner](/docs/assets/banner-dark.svg)
>
> > :InLight
> >
> > ![banner](/docs/assets/banner.svg)

An experimental mash-up of [**RxJS**](https://rxjs-dev.firebaseapp.com) and [**Express**](https://expressjs.com).

```
npm i rxxpress
```

<br>

**RxXpress** provides a `Router` class that behaves similar to [**Express**'s router](http://expressjs.com/en/5x/api.html#router),
except that instead of accepting callbacks it returns an `Observable`:

<br>

> :Tabs
> > :Tab title=router.ts
> > ```ts | router.ts
> > import { Router, respond } from 'rxxpress';
> >
> > const router = new Router();
> > /*!*/router.get('/').pipe(respond(() => 'Hellow World!')).subscribe();  // --> listen on / route
> >
> > export default router;
> > ```
>
> > :Tab title=index.ts
> > ```ts | index.ts
> > import * as express from 'express';     // @see [Express](http://expressjs.com/)
> > import router from './router';
> >
> > const app = express();                 // --> create your express app
> > /*!*/app.use(router.core);                  // --> register the RxXpress router
> > app.listen(3000);                      // --> start listening on port 3000
> > ```

> :Buttons
> > :Button label=Try It!, url=https://codesandbox.io/s/rxxpress-hellow-world-qi85k?file=/src/router.ts

---

# Use Cases

**RxXpress** allows you to easily treat your end-points like streams.
For example, you can conduct rate-limiting on a particular end-point on a per-user
basis (e.g. each user can invoke that particular end-point only once per second):

```ts
import { Router, respond } from 'rxxpress';
import { debounceTime, mergeMap, groupBy } from 'rxjs/operators';

import { authenticate } from './auth';

const router = new Router();
router.post('/rate-limited-endpoint')
.pipe(
/*!*/  authenticate(),                                        // --> authenticates the request, adding `req._.user_id`
/*!*/  groupBy(({req}) => req._.user_id),                     // --> group incoming request by user
/*!*/  mergeMap(group => group.pipe(debounceTime(1000))),     // --> debounce each group to allow one each second
/*!*/  respond(() => 'Halo meine liebe!'),                    // --> respond
)
.subscribe();
```

<br>

Or you can create an end-point that only responds when both _ALICE_ and _BOB_ request
it with their respective keys at the same time (max 5 seconds apart):

```ts
import { Router, timeout } from 'rxxpress';
import { zip } from 'rxjs'; // @see [RxJS zip](https://www.learnrxjs.io/learn-rxjs/operators/combination/zip)
import { filter, retry, tap } from 'rxjs/operators';


const router = new Router();
/*!*/const endpoint = router.get('/endpoint').pipe(timeout(5000));       // --> let the endpoint remain waiting for max 5 seconds

/*!*/zip(                                                                // --> pair corresponding requests
/*!*/  endpoint.pipe(filter(({req}) => req.query.key === ALICE_KEY)),    // --> ALICE requesting with her key
/*!*/  endpoint.pipe(filter(({req}) => req.query.key === BOB_KEY)),      // --> BOB requesting with his key
/*!*/)
/*!*/.pipe(
/*!*/  tap(([alice, bob]) => {                                           // --> Respond when both have requested
/*!*/    alice.res.send('You guys made it!');                            // --> Respond when both have requested
/*!*/    bob.res.send('You guys made it!');                              // --> Respond when both have requested
/*!*/  }),
/*!*/  retry()                                                           // --> retry when it fails (for example, due to timeout)
/*!*/)
.subscribe();
```

> [free_breakfast](:Icon (align=-6px)) &nbsp;&nbsp; **TO BE HONEST ...**
>
> I actually just made this to be able to do weird stuff. I have no proper
> idea of where it would be particularly useful.

---

# Inter-Operability

**RxXpress** is fully inter-operable with **Express**.
You can seamlessly use **RxXpress** alongside existing **Express** code, by passing
**RxXpress** routers to **Express** apps and routers.
You can also use the `use()` operator to integrate existing middlewares, **Express** routers and
other **RxXpress** routers into an **RxXpress** router:

```ts
import * as express from 'express';          // @see [Express](http://expressjs.com/)
import * as bodyParser from 'body-parser';   // @see [body-parser](https://github.com/expressjs/body-parser#readme)
import { Router, use, respond } from 'rxxpress';

const expressRouter = express.Router();                                            // --> a typical express router
expressRouter.get('/express', (req, res) => res.send('From an express router!'));  // --> a typical express router

const subRouter = new Router();                                                    // --> an RxXpress sub-router
router.get('/sub').pipe(respond(() => 'From a sub-route')).subscribe();            // --> an RxXpress sub-router

const router = new Router();
router.use('/').pipe(
/*!*/  use(bodyParser),                                             // --> hook in body-parser middleware
/*!*/  use(expressRouter),                                          // --> hook in an express router
/*!*/  use(subRouter),                                              // --> hook in a sub-router
/*!*/  use((req, res) => res.send('Ok no one respondend to this'))  // --> a fallback response
).subscribe();

const app = express();                  // --> setup express, hook our main router, run it
app.use(router.core);                   // --> setup express, hook our main router, run it
app.listen(3000);                       // --> setup express, hook our main router, run it
```

---

# Convenience Operators

**RxXpress** also provides some other convenient operators, making building web-servers
much more enjoyable:

```ts
import { verify } from 'jsonwebtoken';   // @see [Json Web Token](https://www.npmjs.com/package/jsonwebtoken)
/*!*/import { Router, validate, permit, ifexists, json } from 'rxxpress';

import { User } from './user.model';
import { SECRET } from './secrets';


const router = new Router();
router.get('/user-info/:user_id')
.pipe(
/*!*/  validate(({req}) => {                                               // --> validate that request has a token and the token is valid
    if (!req.query.token) return false;                               // --> validate that request has a token and the token is valid
    try {                                                             // --> validate that request has a token and the token is valid
      req._.payload = verify(req.query.token, SECRET);                // --> validate that request has a token and the token is valid
      return true;                                                    // --> validate that request has a token and the token is valid
    } catch { return false; }                                         // --> validate that request has a token and the token is valid
  }),                                                                 // --> validate that request has a token and the token is valid
/*!*/  permit(({req}) => req._.payload.user_id === req.params.user_id),    // --> permit only if the user owning the token is the requested user
/*!*/  ifexists(async ({req}) => {                                         // --> check if requested user exists
    try {                                                             // --> check if requested user exists
      req._.user = await User.findOne({ _id: req.params.user_id });   // --> check if requested user exists
      return true;                                                    // --> check if requested user exists
    } catch { return false; }                                         // --> check if requested user exists
  }),                                                                 // --> check if requested user exists
/*!*/  json(({req}) => req._.user)                                         // --> respond with the JSON object of the user
)
.subscribe();

export default router;
```


> :ToCPrevNext
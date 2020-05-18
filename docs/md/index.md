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

As you can see, you can easily use **RxXpress** alongside existing **Express** code. **RxXpress** even provides
the `use()` operator to allow integration of existing middlewares, **Express** routers and
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

<br>

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
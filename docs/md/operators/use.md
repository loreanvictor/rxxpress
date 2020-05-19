# `use()` operator


`use()` operator lets you pipe various types of request handlers to your
**RxXpress** routers:

```ts
/*!*/import { Router, use, respond } from 'rxxpress';        // --> import the operator

const router = new Router();
router.get('/:name').pipe(
/*!*/  use((req, res, next) => {                                  // --> lets use a classic request handler
/*!*/    if (req.params.name === 'dude')                          // --> is it the dude?
/*!*/      res.send('You are the dude!');                         // --> its the dude!!
/*!*/    else next();                                             // --> nope? invoke the next handler
/*!*/  }),
/*!*/  respond(() => 'I do not know you!')                        // --> this guy is the next handler
).subscribe();
```

> :Buttons
> > :Button label=Try It!, url=https://codesandbox.io/s/rxxpress-use-examples-vk151

<br>

This means you can easily use any **Express** middleware with your **RxXpress** routers:

```ts
/*!*/import cookieParser from 'cookie-parser';
/*!*/import bodyParser from 'body-parser';
import { Router, use } from 'rxxpress';

const router = new Router();
router.get('/').pipe(
/*!*/  use(cookieParser),
/*!*/  use(bodyParser),
  ...
).subscribe();
```

---

## Sub-Routers

You can also utilize the `use()` operator to mount sub-routers on different paths:

> :Tabs
> > :Tab title=router.ts
> > ```ts | router.ts
> > import { Router, use } from 'rxxpress';
> > /*!*/import subRouter from './sub-router'; // @see tab:sub-router.ts
> > import authenticate from './auth';
> >
> > const router = new Router();
> > router.use('/sub')
> > .pipe(
> >    authenticate(),
> > /*!*/   use(subRouter),                    // --> mount the sub-router
> > )
> > .subscribe();
> > ```
>
> > :Tab title=sub-router.ts
> > ```ts | sub-router.ts
> > import { Router, respond } from 'rxxpress';
> >
> > const router = new Router();
> > router.get('/hellow').pipe(respond(() => 'Hellow!')).subscribe();
> >
> > export default router;
> > ```

You can similarly mount **Express** routers on different paths:

> :Tabs
> > :Tab title=router.ts
> > ```ts | router.ts
> > import { Router, use } from 'rxxpress';
> > /*!*/import subRouter from './sub-router'; // @see tab:sub-router.ts
> > import authenticate from './auth';
> >
> > const router = new Router();
> > router.use('/sub')
> > .pipe(
> >    authenticate(),
> > /*!*/   use(subRouter),                    // --> mount the sub-router
> > )
> > .subscribe();
> > ```
>
> > :Tab title=sub-router.ts
> > ```ts | sub-router.ts
> > /*!*/import { Router } from 'express';     // --> creating an express sub-router
> >
> > const router = Router();
> > router.get('/hellow', (_, res) => res.send('Hellow!'));
> >
> > export default router;
> > ```

---

## Packet Flow

The `use()` operator will not pass incoming packets down the observable sequence:

```ts
router.get('/')
.pipe(
  use((req, res, next) => {
    // do nothing
  }),
  tap(() => console.log('Got Here!'))           // --> you will NEVER get here
)
.subscribe();
```

In this example, you will never get the log `'Got Here!'`, unless the preceding
request handler invokes `next()`:

```ts
router.get('/')
.pipe(
  use((req, res, next) => {
    next();
  }),
  tap(() => console.log('Got Here!'))           // --> you will ALWAYS get here
)
.subscribe();
```

> :ToCPrevNext

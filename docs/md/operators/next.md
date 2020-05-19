# `next()` operator

Will pass the incoming request to the next matching request handler:

```ts
/*!*/import { next } from 'rxxpress';

router.all('/')
.pipe(
/*!*/  validate(({req}) => !!req.query.token),   // --> check if there is a token on request
/*!*/  next()                                    // --> go to next handler
).subscribe();

router.get('/')
.pipe(respond(({req}) => `GET ${req.query.token}`))
.subscribe();

router.post('/')
.pipe(respond(({req}) => `POST ${req.query.token}`))
.subscribe();
```

---

## Safe Mode

By default, `next()` operates in _safe mode_, which means it only passes
the request to next handler IF the request is not responded to:

```ts
router.get('/:name')
.pipe(
/*!*/  tap(({req, res}) => {                                        // --> if it is dude, then respond
/*!*/    if (req.params.name === 'dude') res.send('Yo Dude!');      // --> if it is dude, then respond
/*!*/  }),                                                          // --> if it is dude, then respond
/*!*/  next()                                                       // --> its not dude? go to next handler
).subscribe();

router.get('/:name')
.pipe(respnd(() => 'I do not know you mate'))                       // --> we only recognize the dude!
.subscribe();
```

You can _safe mode_ off by providing a parameter to `next()`:

```ts
router.get(...)
.pipe(
  ...
/*!*/  next(false)            // --> pass incoming request to next handler even if it is already responded to
)
.subscribe();
```

---

## Packet Flow

`next()` will NOT pass incoming packets down the observable sequence:

```ts
router.get('/')
.pipe(
  next(),
  tap(() => console.log('Got Here!'))            // --> YOU WILL NEVER GET HERE!
)
.subscribe();
```

In this example, you will never get to the console log.

> :ToCPrevNext
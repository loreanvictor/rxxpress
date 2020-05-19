# `respond()` and `json()`

`respond()` operator allows for easily responding to requests with OK http status (200)
and some text message:

```ts
/*!*/import { respond } from 'rxxpress';

router.get('/')
/*!*/.pipe(respond(() => 'Hellow World!'))
.subscribe();
```

<br>

You have access to the packet inside the `respond()` operator:

```ts
router.get('/:name')
/*!*/.pipe(respond(({req}) => `Hellow ${req.params.name}`))
.subscribe();
```

<br>

If you want to respond with a JSON, simply use `json()` operator instead. It is identical
to `respond()` except that it responds with JSON instead of text:

```ts
/*!*/import { json } from 'rxxpress';

router.get('/:name')
.pipe(
/*!*/  json(({req}) => ({ message: `Hellow ${req.params.name}` }))
)
.subscribe();
```

---

## Async Functions

You can use async functions inside `respond()` and `json()`:

```ts
router.get('/:name')
.pipe(
/*!*/  respond(async ({req}) => {
/*!*/    const user = await db.find({ name: req.params.name });
/*!*/    return `Hellow ${user.full_name}`;
/*!*/  })
)
.subscribe();
```
```ts
router.get('/:name')
.pipe(
/*!*/  json(async ({req}) => {
/*!*/    const user = await db.find({ name: req.params.name });
/*!*/    return {
/*!*/      message: `Hellow ${user.full_name}`,
/*!*/      recipient: user
/*!*/    };
/*!*/  })
)
.subscribe();
```

---

## Observable Functions

You can also return observables inside `respond()` and `json()`:

```ts
router.get('/')
.pipe(
/*!*/  respond(() => of('Hellow World!').pipe(delay(1000)))
)
.subscribe();
```

```ts
router.get('/')
.pipe(
/*!*/  json(() => of({ msg: 'Hellow World!' }).pipe(delay(1000)))
)
.subscribe();
```

When you provide an observable, the first value emitted by that observable
will be used as response and the observable will be unsubscribed from.

---

## Safety

`respond()` and `json()` only respond IF incoming request was not already responded to:

```ts
router.get('/')
.pipe(
  respond(() => 'AA'),
  respond(() => 'BB'),
)
.subscribe();
```

In the case of this example, the response will always be `'AA'`.

---

## Packet Flow

`respond()` and `json()` never pass incoming packets down the observable
stream, nor they invoke any other request handlers:

```ts
router.get('/')
.pipe(
  respond(() => 42),
  tap(() => console.log('Got Here!'))        // --> YOU WILL NEVER GET HERE!
).subscribe();
```

So for example in the above case, you will never get the console log.

> :ToCPrevNext
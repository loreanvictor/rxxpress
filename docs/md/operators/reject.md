# `reject()` operator

Will _reject_ incoming request with given status and message:

```ts
import { reject } from 'rxxpress';

router.get('/')
.pipe(
  reject(418, 'I am indeed a teapot!')
)
.subscribe();
```

Reject will only respond to the request if it was not already responded
to, making it useful for fallbacks:

```ts
router.use('/')
.pipe(
  use(subRouter1),
  use(subRouter2),
/*!*/  reject(404)         // --> basically, give out a 404 if no sub-router responds
)
.subscribe();
```

---

## Aliases

You can use `badrequest()`, `unauthorized()`, `forbidden()` or `notfound()`
instead of `reject()`. They are identical, except that they respond with corresponding
http status (`400`, `401`, `403`, `404`):

```ts
/*!*/import { badrequest, unauthorized, forbidden, notfound } from 'rxxpress';

router.use('/')
.pipe(
  use(subRouter1),
  use(subRouter2),
/*!*/  notfound()
)
.subscribe();
```

Or with a custom message:

```ts
router.use('/')
.pipe(
  use(subRouter1),
  use(subRouter2),
/*!*/  notfound('Weird URL man')
)
.subscribe();
```

---

## Packet Flow

`reject()` (and its aliases) do not pass down incoming packets:

```ts
router.get('/')
.pipe(
  forbidden(),
  tap(() => console.log('Got Here!'))     // --> YOU WILL NEVER GET HERE!
)
.subscribe();
```

So in this example, you will never get to the console log.

> :ToCPrevNext
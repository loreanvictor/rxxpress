# `timeout()` operator

Will track each incoming packet. If not responded to in given timeframe (in milliseconds),
will respond to it with a timeout signal (`408`):

```ts
import { timeout } from 'rxxpress';

router.get('/')
.pipe(
/*!*/  timeout(200),        // --> respond with a timeout if requests are not responded to after 200 milliseconds
  ...
)
.subscribe();
```

---

## Safe Mode

By default, `timeout()` operates in safe mode, i.e. it will not throw an error
in case of a timeout. You can disable that behavior by providing a second argument
to it:

```ts
router.get('/')
.pipe(
/*!*/  timeout(200, false),         // --> not in safe mode, will throw an error in case of timeout
  ...
)
.subscribe(
  undefined,
/*!*/  err => {                     // --> catch the error as well
/*!*/    ...                        // --> catch the error as well
/*!*/  }                            // --> catch the error as well
)
```

> :ToCPrevNext
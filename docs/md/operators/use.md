# `use()` operator


`use()` operator lets you pipe various types of request handlers to your
**RxXpress** routers:

```ts
/*!*/import { Router, use, respond } from 'rxxpress';        // --> import the operator

const router = new Router();
router.get('/:name').pipe(
  use((req, res, next) => {
    if (req.name === 'dude') res.send('You are the dude!');
  }),
  respond(() => 'I do not know you!')
).subscribe();
```


> :ToCPrevNext

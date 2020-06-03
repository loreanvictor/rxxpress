# `join()`

If you want to conduct some operations in parallel, you could use `join()`:

```ts
/*!*/import { join, allow, find, json } from 'rxxpress';

const endpoint = router.get('/article/:id').pipe(authenticate());                  // --> get the endpoint

const findArticle = endpoint.pipe(                                                 // --> find the requested article
  find(async ({req}) => {                                                          // --> find the requested article
    req._.article = await articles.findById(req.params.id);                        // --> find the requested article
    return !!req._.article;                                                        // --> find the requested article
  })                                                                               // --> find the requested article
);                                                                                 // --> find the requested article

const checkUserAccess = endpoint.pipe(                                             // --> check if user is subscribed or still have free articles
  find(async ({req}) => {                                                          // --> check if user is subscribed or still have free articles
    req._.payment = await payment.findOne({ userId: req._.userId });               // --> check if user is subscribed or still have free articles
    return !!req._.payment;                                                        // --> check if user is subscribed or still have free articles
  }),                                                                              // --> check if user is subscribed or still have free articles
  allow(({req}) => req._.payment.subscribed || req._.payment.freeArticles > 0)     // --> check if user is subscribed or still have free articles
);                                                                                 // --> check if user is subscribed or still have free articles

/*!*/join(findArticle, checkUserAccess).pipe(                                           // --> use `join()` to do two things in parallel ...
/*!*/  json(({req}) => req._.article)                                                   // --> respond with the article
/*!*/)
.subscribe();
```

Or if you prefer to write everything in one go:

```ts
/*!*/import { join, allow, find, json } from 'rxxpress';


router.get('/article/:id')
.pipe(
  authenticate(),                                                                    // --> authenticate the user
/*!*/  endpoint => join(                                                                  // --> use `join()` to do two things in parallel ...
/*!*/    endpoint.pipe(                                                                   // --> find the requested article
/*!*/      find(async ({req}) => {                                                        // --> find the requested article
/*!*/        req._.article = await articles.findById(req.params.id);                      // --> find the requested article
/*!*/        return !!req._.article;                                                      // --> find the requested article
/*!*/      })                                                                             // --> find the requested article
/*!*/    ),                                                                               // --> find the requested article
/*!*/    endpoint.pipe(                                                                   // --> check if user is subscribed or still have free articles
/*!*/      find(async ({req}) => {                                                        // --> check if user is subscribed or still have free articles
/*!*/        req._.payment = await payment.findOne({ userId: req._.userId });             // --> check if user is subscribed or still have free articles
/*!*/        return !!req._.payment;                                                      // --> check if user is subscribed or still have free articles
/*!*/      }),                                                                            // --> check if user is subscribed or still have free articles
/*!*/      allow(({req}) => req._.payment.subscribed || req._.payment.freeArticles > 0),  // --> check if user is subscribed or still have free articles
/*!*/    )                                                                                // --> check if user is subscribed or still have free articles
/*!*/  ),                                                                                 // --> both things done
  json(({req}) => req._.article)                                                     // --> respond with the article
)
.subscribe();
```

---

## Safety

By default, `join()` will ingore requests that are responded to. It will also ignore tracked
packets at the moment they are responded to.

You can disable this behavior by passing `{ safe: false }` option:

```ts
join({ safe: false }, someTask$, someOtherTask$)
.pipe(
  // ...
).subscribe();
```

Be careful that when _safe mode_ is turned off, `join()` will keep track of all incoming packets
until all of the tasks are done with those packets, which in some cases might lead to
memory leaks.

---

## Packet Flow

`join()` will start tracking each incoming packet (which it receives when the first task is finished)
IF they are not responded to. It will keep tracking the packet until all other tasks are also
finished, and then it will pass the packet down the observable sequence.

Unless _safe mode_ is turned off, `join()` will ignore packets that are responded to, not passing
them down the observable sequence.

> :ToCPrevNext
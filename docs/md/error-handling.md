# Error Handling

Error handling can be confusing in **Express** apps, as you can easily
throw an error in a context where no one is there to catch it. Error handling
in **RxJS** is even more confusing, since an error basically causes you
to become unsubscribed from your source observables.

To mitigate these difficulties, **RxXpress**'s operators try to catch
as many errors as they can and pass them down the observable sequence, so that
they can be handled in a unified manner.

This still means that you would need to manage the errors in your observable
sequence, as unhandled errors will cause your sequence to be unsubscribed
from your end-points.

To mitigate that, you can re-subscribe to your endpoints using 
[**RxJS**'s `retry` operator](https://www.learnrxjs.io/learn-rxjs/operators/error_handling/retry):

```ts
router.get('/')
.pipe(
  ...
/*!*/  tap(undefined, err => console.log('ERROR:: ' + err)),   // --> Log the error
/*!*/  retry(),                                                // --> Re-subscribe to the end-point
)
.subscribe();
```

It is highly recommended to safe-guard your routers with this method
on production, as you can never be too-cautious about your API server.

> [warning](:Icon) **WARNING**
>
> This approach WILL NOT guarantee that all errors are caught.
> You still can easily throw errors in contextes that no one is there
> to catch them, causing a shut-down in Node.

> :ToCPrevNext
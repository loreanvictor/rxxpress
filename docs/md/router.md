# Router

The `Router` class allows you to create end-point observables:

```ts
import { Router } from 'rxxpress';

const router = new Router();
/*!*/router.get('/').pipe(...).subscribe();            // --> define a `GET` endpoint on '/'
/*!*/router.put('/').pipe(...).subscribe();            // --> define a `PUT` endpoint on '/'

/*!*/router.get('/stuff').pipe(...).subscribe();       // --> define a `GET` endpoint on '/stuff'
/*!*/router.post('/stuff').pipe(...).subscribe();      // --> define a `POST` endpoint on '/stuff'
/*!*/router.delete('/stuff').pipe(...).subscribe();    // --> define a `DELETE` endpoint on '/stuff'

export default router;
```

You can then _use_ router instances on **Express** apps and routers:

```ts
import * as express from 'express';
import router from './router';

const app = express();
/*!*/app.use(router.core);                             // --> DO NOT FORGET THE .core
app.listen();
```

> :ToCPrevNext
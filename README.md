# workers

Implementation of Cloudflare Workers

![image](https://user-images.githubusercontent.com/5887929/217077341-d269730b-7896-4b27-8048-8c93516a70ec.png)


## How to publish worker

- https://developers.cloudflare.com/workers/get-started/guide/#7-publish-your-project


## Contributing

### Create a new worker

> This is a guide to create a new typescript worker

1. When you create a new worker, you need to add a new directory in the root.

> Usually the name of the directory is the same as the name of the worker. The name is usually stated in the issue


```bash
npx wrangler init profile
```

2. Install deps

For most of the typescript workers, you need to install `hono`

```bash
npm install hono --save
```

For the better developer experience please also install prettier 
  
```bash
npm install prettier --save-dev
```

**If the workers requires using D1**

Install `kysely` and `kysely-d1` as the dependecies

```bash
npm install kysely kysely-d1 --save
```

Install `better-sqlite3` and `kysely-codegen` as the dev dependencies

```bash
npm install better-sqlite3 kysely-codegen --save-dev
```

To use `kysely-codegen` to generate the typescript types, you need to add the following script in `package.json`

```json
{
  "scripts": {
    "codegen": "kysely-codegen --dialect sqlite --out-file src/utils/types.ts",
  }
}
```

⚠️ to use `kysely-codegen`, you need to have a `.env` file.

```bash
DATABASE_URL=/absolute/path/to/the/working/directory/workers/<worker-name>/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/<uuid>.sqlite
```

Create a database file with schema called `schema.sql`.


**If the workers requires using fetching data**

Install `ofetch` as the dependencies

```bash
npm install ofetch --save
```

To create new service, you need to create a new file in `src/utils` directory.

```ts
import { $fetch, FetchError } from 'ohmyfetch'

const BASE_URL = 'http://localhost:8787'

const api = $fetch.create({
  baseURL: BASE_URL,
})
```

**If the workers requires using data from KodaDot**

Install `@kodadot/uniquery` as the dependencies

```bash
npm install @kodadot/uniquery --save
```

Usage can be found in [kodadot/uniquery](https://github.com/kodadot/uniquery) repository.

3. Code structure

As there is not much restriction on the code structure, you can refer to the existing workers.

> make sure that dependencies in `package.json` are before dev dependencies

**If the workers using middleware**

Put the middleware in `src/middleware` directory.

```ts
import { Context } from 'hono'
import { HonoEnv } from '../utils/constants'

export const sampleMiddleware = async (c: Context<HonoEnv, string>, next: Function) => {
  // do something
  await next()
}
```

**If the workers using more than one route**

Put the routes in `src/routes` directory.

```ts
import { Hono } from 'hono'
import { HonoEnv } from '../utils/constants'


const app = new Hono<HonoEnv>()

app.get('/', async (c) => {
  return c.json({ message: 'Hello World' })
})

export { app as sameNameAsTheFile }
```

then in `src/index.ts`

```ts
app.route('/complex-route', sameNameAsTheFile)
```

4. Making a PR

After you have done the implementation, you can make a PR to this repository.
Please make sure that you have tested the worker locally before making a PR.
Please use `prettier` to format the code before making a PR.

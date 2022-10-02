# Squiki

Get the status of KodaDot's SubSquid indexers via simple API.

![](./squiki.jpg)


# FAQ

## API

```
- /list - get all available squids
- /status/:id - get info about our current squids
```

## Dev

1. Instal `wrangler` CLI V2

```bash
npx wrangler
```

2. Login

```bash
npx wrangler login
```

3. Import `SUBSQUID_API_TOKEN`

```bash
npx wrangler secret
```

4. Run dev

```bash
npx wrangler dev
```


9999. Publish

```bash
npx wrangler publish
```

## Caveats

1. Make sure you setup correct `account_id` in `wrangler.toml`
2. Make sure you have `SUBSQUID_API_TOKEN`

## Fun fact

That plush squid is our mascot in [SubWork Bled](https://subwork.xyz).
What's the origin of the name? It's a combination of Squid and Viki.

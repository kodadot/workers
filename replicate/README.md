# Replicate

Reimplementation of the [Replicate](https://replicate.ai/) platform in Rust.


# FAQ

## API

```
- POST `/predict/:id` - Make prediction where `:id` is the model ID
- GET `/status/:id` - Get status of prediction where `:id` is prediction ID
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

3. Run dev

```bash
npx wrangler dev
```


9999. Publish

```bash
npx wrangler publish
```

## Caveats

1. Make sure you setup correct `account_id` in `wrangler.toml`

## Fun fact

Majority of code was taken from our awesome developer @preschain
[The original repo is here](https://github.com/preschian/k-workers)
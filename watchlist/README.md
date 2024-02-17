# watchlist API

## Overview

- `GET    /watchlists` - list all watchlists
- `POST   /watchlists` - create watchlist
- `GET    /watchlists/default` - get default watchlist
- `GET    /watchlists/:id` - get one watchlist
- `PUT    /watchlists/:id` - update one watchlist (only name can be updated for now)
- `PUT    /watchlists/:id/set-default` - set default watchlist
- `DELETE /watchlists/:id` - delete watchlist
-
- `GET    /watchlists/:id/chains/:chain_id/items` - list items in watchlist
- `GET    /watchlists/default/chains/:chain_id/items` - list items in default watchlist
- `POST   /watchlists/:id/chains/:chain_id/items` - add to watchlist
- `POST   /watchlists/default/chains/:chain_id/items` - add to default watchlist
- `GET    /watchlists/:id/chains/:chain_id/items/:item_id/exists` - check if item exists in watchlist
- `GET    /watchlists/default/chains/:chain_id/items/:item_id/exists` - check if item exists in default watchlist
- `DELETE /watchlists/:id/chains/:chain_id/items/:item_id` - remove from watchlist
- `DELETE /watchlists/default/chains/:chain_id/items/:item_id` - remove from default watchlist

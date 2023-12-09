import { validator } from 'hono/validator'

function isValidType(type: string) {
  return ['nft', 'collection'].includes(type)
}

export function authAddressValidator() {
  return validator('header', (value, c) => {
    if (!value['x-auth-address']) {
      return c.json({ error: 'missing auth address' }, 400)
    }
    return value
  })
}

export function itemSearchParamsValidator() {
  return validator('param', (value, c) => {
    const { chain, type, id } = value
    if (!chain || !type || !id) {
      return c.json({ error: 'chain, type, id are required' }, 400)
    }

    if (!isValidType(type)) {
      return c.json({ error: 'invalid type' }, 400)
    }
    return value
  })
}

export function listSearchParamsValidator() {
  return validator('param', (value, c) => {
    const { chain, type } = value
    if (!chain || !type) {
      return c.json({ error: 'chain, type are required' }, 400)
    }

    if (!isValidType(type)) {
      return c.json({ error: 'invalid type' }, 400)
    }

    return value
  })
}

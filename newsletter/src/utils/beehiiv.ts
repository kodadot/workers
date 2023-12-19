import { Context } from "hono"
import { BEEHIIV_API_URL } from "./constants"
import { HonoEnv } from "./types"

export const subscribe = (email: string, c: Context<HonoEnv>) => {
    const apiKey = c.env.BEEHIIV_API_KEY
    const publicationId = c.env.BEEHIIV_PUBLICATION_ID

    return fetch(BEEHIIV_API_URL + `/publications/${publicationId}/subscriptions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            email: email,
            double_opt_override: 'on'
        })
    })
}

export const getSubscriptionByEmail = (email: string, c: Context<HonoEnv>) => {
    const apiKey = c.env.BEEHIIV_API_KEY
    const publicationId = c.env.BEEHIIV_PUBLICATION_ID

    return fetch(BEEHIIV_API_URL + `/publications/${publicationId}/subscriptions/by_email/${email}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    })
} 
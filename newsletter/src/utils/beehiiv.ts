import { Context } from "hono"
import { BEEHIIV_API_URL } from "./constants"
import { HonoEnv } from ".."

type SubscribeParams = {
    email: string,
    publicationId: string
}

export const subscribe = ({ email, publicationId }: SubscribeParams, c: Context<HonoEnv>) => {
    const API_KEY = c.env.BEEHIIV_API_KEY

    return fetch(BEEHIIV_API_URL + `/publications/${publicationId}/subscriptions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            email: email
        })
    })
} 
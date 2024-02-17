import { type Connection as PartyConnection } from "partykit/server"

type Cursor = {
    x: number
    y: number
    cursor?: 'touch' | 'mouse'
    lastUpdate?: number
}

export type UserDetails = {
    id: string
    spent?: number
} & Cursor

export type MaybeUserDetails = UserDetails | null

export type UpdateMessage = {
    type: 'update',
    details: UserDetails
}

export type RemoveMessage = {
    type: 'remove',
    id: string
}

export type SyncMessage = {
    type: 'sync',
    connections: Record<string, UserDetails | null>
}

export type Connection = PartyConnection & { state: UserDetails | undefined }
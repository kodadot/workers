import { type Connection as PartyConnection } from "partykit/server"

type CursorType = 'touch' | 'mouse'

export type Cursor = {
    x: number
    y: number
    type?: CursorType
    lastUpdate?: number
}

type EventType = 'drop_generating' | 'drop_minting' | 'drop_minted'

export type Event = {
    id: string,
    type: EventType
    image?: string
    completed?: boolean
    timestamp: number
}

export type UserDetails = {
    id: string
    spent?: number
    cursor?: Cursor
    lastEvent?: Event
}

export type MaybeUserDetails = UserDetails | null

export type UpdateUserDetailsBody = {
    spent?: number
    event?: Omit<Event, 'timestamp'>
    cursor?: Omit<Cursor, 'lastUpdate'>
}

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
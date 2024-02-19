import type * as Party from "partykit/server";
import type { Connection, Cursor, Event, MaybeUserDetails, RemoveMessage, SyncMessage, UpdateMessage, UpdateUserDetailsBody, UserDetails } from "./types";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) { }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`Connected: id: ${conn.id} room: ${this.room.id} url: ${new URL(ctx.request.url).pathname}`
    );

    const connections = new Map<string, MaybeUserDetails>()
    for (const connection of this.room.getConnections()) {
      if (connection.id === conn.id) {
        continue
      }
      connections.set(connection.id, connection.state as MaybeUserDetails)
    }

    const message = <SyncMessage>{
      type: 'sync',
      connections: Object.fromEntries(connections.entries())
    }

    conn.send(JSON.stringify(message));
  }

  onMessage(message: string, sender: Connection) {
    console.log(`onMessage: ${sender.id} sent message: ${message}`);

    const data = JSON.parse(message) as UpdateUserDetailsBody

    const details = this.updateDetails(sender, data)

    const msg = <UpdateMessage>{
      type: 'update',
      details: details
    }

    this.room.broadcast(JSON.stringify(msg), [sender.id])
  }

  onClose(connection: Party.Connection) {
    const message = <RemoveMessage>({ type: 'remove', id: connection.id, })
    this.room.broadcast(JSON.stringify(message))
  }

  updateDetails(connection: Connection, body: UpdateUserDetailsBody) {
    const prevDetails = connection.state as MaybeUserDetails

    const updatedUserDetails = <UserDetails>{
      id: connection.id,
      spent: body.spent,
      cursor: prevDetails?.cursor,
      lastEvent: prevDetails?.lastEvent
    }

    const prevCursor = prevDetails?.cursor
    const needsNewCursor = body.cursor && Date.now() - (prevCursor?.lastUpdate || 0) > 100

    if (needsNewCursor) {
      Object.assign(updatedUserDetails, {
        cursor: {
          x: body.cursor?.x,
          y: body.cursor?.y,
          type: body.cursor?.type,
          lastUpdate: Date.now()
        } as Cursor
      })
    }

    const prevLastEvent = prevDetails?.lastEvent
    const updateLastEvent = body.event && prevLastEvent?.id !== body.event?.id || prevLastEvent?.type === body.event?.type && body.event?.completed

    if (updateLastEvent) {
      Object.assign(updatedUserDetails, {
        lastEvent: {
          id: (body.event as Event).id,
          type: (body.event as Event).type,
          completed: (body.event as Event).completed,
          image: body.event?.image,
          timestamp: Date.now()
        } as Event
      })
    }

    if (!prevDetails || needsNewCursor || updateLastEvent) {
      console.log(`Updating details: ${connection.id} with ${JSON.stringify(updatedUserDetails)}`);
      connection.setState(updatedUserDetails)
    }

    return updatedUserDetails
  }
}

Server satisfies Party.Worker;

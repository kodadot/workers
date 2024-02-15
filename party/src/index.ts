import type * as Party from "partykit/server";
import type { Connection, RemoveMessage, SyncMessage, UpdateMessage, UserDetails } from "./types";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) { }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`Connected: id: ${conn.id} room: ${this.room.id} url: ${new URL(ctx.request.url).pathname}`
    );

    const connections = []
    for (const connection of this.room.getConnections()) {
      if (connection.id === conn.id) {
        continue
      }
      connections.push(connection.state as UserDetails)
    }

    const message = <SyncMessage>{
      type: 'sync',
      connections: connections
    }

    conn.send(JSON.stringify(message));
  }

  onMessage(message: string, sender: Connection) {
    console.log(`onMessage: ${sender.id} sent message: ${message}`);

    const data = JSON.parse(message)

    const userDetails = <UserDetails>{
      id: sender.id,
      x: data.x,
      y: data.y,
      cursor: data.cursor,
      spent: data.spent,
      lastUpdate: Date.now()
    }

    this.updateDetails(sender, userDetails)

    const msg = userDetails.x && userDetails.y ? <UpdateMessage>{
      type: 'update',
      details: userDetails
    } : <RemoveMessage>({ type: 'remove', id: sender.id, })

    this.room.broadcast(JSON.stringify(msg), [sender.id])
  }

  updateDetails(connection: Connection, details: UserDetails) {
    const prevDetails = connection.state

    const needsNew = prevDetails?.lastUpdate && details.lastUpdate as number - (prevDetails.lastUpdate || 0) > 100

    if (!prevDetails || needsNew) {
      connection.setState(details)
    }
  }

  onClose(connection: Party.Connection) {
    const message = <RemoveMessage>({ type: 'remove', id: connection.id, })
    this.room.broadcast(JSON.stringify(message))
  }
}

Server satisfies Party.Worker;

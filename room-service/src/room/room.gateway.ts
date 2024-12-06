import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(4321, { namespace: '/socket.io' })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
    this.server.emit('room', `${client.id} joined!`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.server.emit('room', `${client.id} left!`);
  }

  @SubscribeMessage('customName')
  handleMessage(client: Socket, message: string): void {
    console.log(`[${client.id}] sent message: ${message}`);
    this.server.emit('room', `[${client.id}] -> ${message}`);
  }

  @SubscribeMessage('error')
  handleError(client: Socket, error: string): void {
    console.log(`Error with client ${client.id}: ${error}`);
  }
}

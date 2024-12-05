import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(4321)
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket): void {
    this.server.emit('room', client.id + ' joined!');
  }

  handleDisconnect(client: Socket): void {
    this.server.emit('room', client.id + ' left!');
  }

  @SubscribeMessage('customName')
  handleMessage(client: Socket, message: string): void {
    console.log(message);
    this.server.emit('room', `[${client.id}] -> ${message}`);
  }
}

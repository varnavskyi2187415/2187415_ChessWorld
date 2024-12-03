import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway {
  @WebSocketServer()
  server: Server;

  constructor() {
    this.startPeriodicMessages();
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string, client: Socket): void {
    console.log(`Received message: ${message}`);
    this.server.emit('message', message);
  }

  @SubscribeMessage('join')
  handleJoinRoom(@MessageBody() room: string, client: Socket): void {
    client.join(room);
    console.log(`Client joined room: ${room}`);
    client.emit('joinedRoom', room);
  }

  private startPeriodicMessages(): void {
    setInterval(() => {
      const message = `Server time: ${new Date().toISOString()}`;
      console.log(`Sending periodic message: ${message}`);
      this.server.emit('periodicMessage', message);
    }, 1000);
  }
}

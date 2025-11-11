import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', 
     credentials: true,
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;


   handleConnection(client: any) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`🔌 Utilisateur connecté au canal user_${userId}`);
    }
  }

  sendToUser(userId: Number, notif: any) {
    this.server.to(`user_${userId}`).emit('notification', notif);
  }


  
}

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { PeerDto } from './dto/peer.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({ path: '/chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  chatRooms: Map<string, Set<string>> = new Map();

  private getPeer(client: Socket) {
    for (const [key, room] of this.chatRooms) {
      if (room.has(client.id)) {
        const peerIndex = [...room].indexOf(client.id) === 0 ? 1 : 0;
        return this.server.sockets.sockets.get([...room][peerIndex]);
      }
    }
  }

  handleConnection(client: Socket) {
    client.emit(JSON.stringify({ type: 'connected' }));
    // console.log('Cliente conectado.' + client.id);
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado.');
    for (const [key, room] of this.chatRooms) {
      if (room.has(client.id)) {
        room.delete(client.id);
        if (room.size === 0) this.chatRooms.delete(key);
        else if (room.size === 1) {
          const peer = this.server.sockets.sockets.get([...room][0]);
          peer?.emit(JSON.stringify({ type: 'leave' }));
          this.chatRooms.delete(key);
        }
        break;
      }
    }
  }

  @SubscribeMessage('join')
  join(@ConnectedSocket() client: Socket) {
    // const { rooms } = this.server.sockets.adapter;
    for (const [key, room] of this.chatRooms.entries()) {
      if (room.size === 0) this.chatRooms.delete(key);
      if (room.size === 2) continue;
      if (room.size === 1) {
        this.chatRooms.get(key)!.add(client.id);
        const peer = this.getPeer(client);
        if (!peer) {
          client.emit(JSON.stringify({ type: 'leave' }));
          return;
        }

        // this.chatRooms.set(key, new Set([...room, client.id]));
        client.emit(
          JSON.stringify({ type: 'ready', room: key, peer: peer.id }),
        );
        peer.emit(
          JSON.stringify({ type: 'ready', room: key, peer: client.id }),
        );
        // console.log(this.chatRooms);
        return;
      }
    }
    const key = uuidv4().slice(0, 8);
    this.chatRooms.set(key, new Set([client.id]));
    client.emit(JSON.stringify({ type: 'created', room: key }));
    // console.log(this.chatRooms);
  }

  @SubscribeMessage('message')
  message(@ConnectedSocket() client: Socket, @MessageBody() peerDto: any) {
    try {
      const peer = JSON.parse(peerDto);
      client.to(peer.peer).emit(JSON.stringify(peer));
    } catch (error) {
      console.log(error);
    }
  }
}

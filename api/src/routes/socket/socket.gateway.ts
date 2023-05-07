import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { CreateSocketDto } from './dto/create-socket.dto';
import { UpdateSocketDto } from './dto/update-socket.dto';
import { Socket, Server } from 'socket.io';
import { log } from 'console';

@WebSocketGateway({ path: '/socket', cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly socketService: SocketService) {}

  @WebSocketServer()
  server: Server;

  clients: Socket[] = [];

  handleConnection(client: Socket) {
    console.log('Cliente conectado.' + client.id);

    this.clients.push(client);
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado.');
    this.clients = this.clients.filter((c) => c !== client);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomName: string) {
    // console.log('Join room reqest');
    const { rooms } = this.server.sockets.adapter;
    const room = rooms.get(roomName);
    if (room === undefined) {
      client.join(roomName);
      client.emit('created');
    } else if (room.size === 1) {
      // room.size == 1 when one person is inside the room.
      client.join(roomName);
      client.emit('joined');
    } else {
      // when there are already two people inside the room.
      client.emit('full');
    }
    // console.log(rooms);
  }

  @SubscribeMessage('ready')
  ready(@ConnectedSocket() client: Socket, @MessageBody() roomName: string) {
    // client.broadcast.to(roomName).emit('ready'); // Informs the other peer in the room.
    this.server.to(roomName).emit('ready');
  }

  @SubscribeMessage('leave')
  leave(@ConnectedSocket() client: Socket, @MessageBody() roomName: string) {
    log('Leave room request');
    client.leave(roomName);
    client.broadcast.to(roomName).emit('leave'); // Informs the other peer in the room.
  }

  @SubscribeMessage('offer')
  onOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: [roomName: string, offer: any],
  ) {
    // console.log('Oferta recibida');
    // Enviar oferta a otro cliente
    client.broadcast.to(payload[0]).emit('offer', payload[1]);
  }

  @SubscribeMessage('answer')
  onAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: [roomName: string, answer: any],
  ) {
    // console.log('Respuesta recibida');
    client.broadcast.to(payload[0]).emit('answer', payload[1]);
    // Enviar respuesta a otro cliente
  }

  @SubscribeMessage('iceCandidate')
  onIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: [roomName: string, iceCandidate: any],
  ) {
    // console.log('Candidato ICE recibido');
    // console.log(payload[1]);
    // Enviar candidato ICE a otro cliente
    client.broadcast.to(payload[0]).emit('iceCandidate', payload[1]);
  }
}
// @WebSocketGateway({ path: '/socket', cors: true })
// export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   constructor(private readonly socketService: SocketService) {}

//   @SubscribeMessage('createSocket')
//   create(@MessageBody() createSocketDto: CreateSocketDto) {
//     console.log('hola');
//     console.log(createSocketDto);
//     return this.socketService.create(createSocketDto);
//   }

//   @SubscribeMessage('offer')
//   handleOffer(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: string,
//   ): void {
//     console.log('hola');
//     this.socketService.sendOffer(client, data);
//   }

//   @SubscribeMessage('answer')
//   handleAnswer(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: string,
//   ): void {
//     this.socketService.sendAnswer(client, data);
//   }

//   @SubscribeMessage('ice-candidate')
//   handleIceCandidate(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: string,
//   ): void {
//     this.socketService.sendIceCandidate(client, data);
//   }

//   @SubscribeMessage('removeSocket')
//   remove(@MessageBody() id: number) {
//     return this.socketService.remove(id);
//   }

//   @SubscribeMessage('connect')
//   handleConnection(client: Socket) {

//     console.log(`Un cliente se ha conectado con ID ${client.id}`);
//   }

//   handleDisconnect(client: Socket) {
//     console.log(client);

//     console.log(`El cliente con ID ${client.id} se ha desconectado`);
//   }
// }

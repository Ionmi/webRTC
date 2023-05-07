import { Injectable } from '@nestjs/common';
import { CreateSocketDto } from './dto/create-socket.dto';
import { UpdateSocketDto } from './dto/update-socket.dto';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
  create(createSocketDto: CreateSocketDto) {
    return 'This action adds a new socket';
  }

  sendOffer(client: Socket, offer: string) {
    console.log(client);
    console.log(offer);

    client.broadcast.emit('offer', offer);
  }

  sendAnswer(client: any, answer: any) {
    client.broadcast.emit('answer', answer);
  }

  sendIceCandidate(client: any, iceCandidate: any) {
    client.broadcast.emit('ice-candidate', iceCandidate);
  }

  findAll() {
    return `This action returns all socket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} socket`;
  }

  update(id: number, updateSocketDto: UpdateSocketDto) {
    return `This action updates a #${id} socket`;
  }

  remove(id: number) {
    return `This action removes a #${id} socket`;
  }
}

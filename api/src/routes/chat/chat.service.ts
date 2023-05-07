import { Injectable } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  create(ChatDto: ChatDto) {
    return 'This action adds a new chat';
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

  update(id: number, updateSocketDto: UpdateChatDto) {
    return `This action updates a #${id} socket`;
  }

  remove(id: number) {
    return `This action removes a #${id} socket`;
  }
}

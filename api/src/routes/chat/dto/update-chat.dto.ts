import { PartialType } from '@nestjs/mapped-types';
import { ChatDto } from './chat.dto';

export class UpdateChatDto extends PartialType(ChatDto) {
  id: number;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class ChatDto {
  @IsNotEmpty()
  @IsString()
  type: string;
  @IsNotEmpty()
  payload: any;
  @IsString()
  @IsNotEmpty()
  room: string;
}

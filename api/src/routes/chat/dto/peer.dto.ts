import { IsNotEmpty, IsString } from 'class-validator';

export class PeerDto {
  @IsNotEmpty()
  @IsString()
  type: string;
  @IsNotEmpty()
  payload: any;
  @IsString()
  @IsNotEmpty()
  peer: string;
}

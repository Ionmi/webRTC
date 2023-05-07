import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from './routes/socket/socket.module';
import { ChatModule } from './routes/chat/chat.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SocketModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// ThrottlerModule.forRoot({
//   ttl: 60,
//   limit: 10,
// }),

// AuthGuard

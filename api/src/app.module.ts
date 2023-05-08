import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './routes/chat/chat.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// ThrottlerModule.forRoot({
//   ttl: 60,
//   limit: 10,
// }),

// AuthG
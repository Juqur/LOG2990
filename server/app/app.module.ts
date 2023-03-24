import { GameGateway } from '@app/gateways/game/game.gateway';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { join } from 'path';
import { ImageController } from './controllers/image/image.controller';
import { ChatService } from './services/chat/chat.service';
import { GameService } from './services/game/game.service';
import { ImageService } from './services/image/image.service';
import { TimerService } from './services/timer/timer.service';

@Module({
    imports: [
        NestjsFormDataModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: join('assets/images'),
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature(),
    ],
    controllers: [ImageController],
    providers: [GameGateway, ImageService, GameService, ChatService, TimerService, Logger],
})
export class AppModule {}

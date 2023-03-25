import { ImageController } from '@app/controllers/image/image.controller';
import { GameGateway } from '@app/gateways/game/game.gateway';
import { levelSchema } from '@app/model/schema/level.schema';
import { ChatService } from '@app/services/chat/chat.service';
import { GameService } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { join } from 'path';

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
        MongooseModule.forFeature([{ name: 'Level', schema: levelSchema }]),
    ],
    controllers: [ImageController],
    providers: [GameGateway, ImageService, GameService, ChatService, MongodbService, TimerService, Logger],
})
export class AppModule {}

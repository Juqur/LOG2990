import { ImageController } from '@app/controllers/image/image.controller';
import { GameGateway } from '@app/gateways/game/game.gateway';
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
import { GameHistory, gameHistorySchema } from './model/schema/game-history.schema';
import { Level, levelSchema } from './model/schema/level.schema';

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
                uri: config.get<string>('DATABASE_CONNECTION_STRING'),
            }),
        }),
        MongooseModule.forFeature([
            { name: Level.name, schema: levelSchema },
            { name: GameHistory.name, schema: gameHistorySchema },
        ]),
    ],
    controllers: [ImageController],
    providers: [GameGateway, ImageService, GameService, ChatService, MongodbService, TimerService, Logger],
})
export class AppModule {}

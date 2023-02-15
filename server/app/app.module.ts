import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { TimerGateway } from '@app/gateways/timer/timer.gateway';
// import { Course, courseSchema } from '@app/model/database/course';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { join } from 'path';
import { GameController } from './controllers/game/game.controller';
import { ImageController } from './controllers/image/image.controller';
import { GameStateService } from './services/game/game.service';
import { ImageService } from './services/image/image.service';

@Module({
    imports: [
        NestjsFormDataModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: join('assets/images'),
        }),
        // MongooseModule.forRootAsync({
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: async (config: ConfigService) => ({
        //         uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
        //     }),
        // }),
        // MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
    ],
    controllers: [ImageController, GameController],
    providers: [ChatGateway, TimerGateway, ImageService, Logger, GameStateService],
})
export class AppModule {}

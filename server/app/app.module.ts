import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { TimerGateway } from '@app/gateways/timer/timer.gateway';
// import { Course, courseSchema } from '@app/model/database/course';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameController } from './controllers/game/game.controller';
import { ImageController } from './controllers/image/image.controller';
import { ImageServiceProvider } from './providers/image.service.provider';
import { GameStateService } from './services/game/game.service';
import { ImageService } from './services/image/image.service';

@Module({
    imports: [
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
    controllers: [DateController, ExampleController, ImageController, GameController],
    providers: [ChatGateway, TimerGateway, DateService, ExampleService, ImageService, Logger, ImageServiceProvider, GameStateService],
})
export class AppModule {}

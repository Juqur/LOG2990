import { Level, levelModel } from '@app/model/schema/level.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongodbService } from './mongodb.service';

describe('MongodbService', () => {
    let service: MongodbService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MongodbService,
                {
                    provide: getModelToken(Level.name),
                    useValue: levelModel,
                },
            ],
        }).compile();

        service = module.get<MongodbService>(MongodbService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

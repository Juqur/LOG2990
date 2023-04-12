import { Level } from '@app/model/schema/level.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Level as LevelDto } from 'assets/data/level';
import { MongodbService } from './mongodb.service';

describe('MongodbService', () => {
    let service: MongodbService;
    let levelModel: unknown;

    beforeEach(async () => {
        levelModel = { create: jest.fn() };

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

    describe('createNewLevel', () => {
        it('should create a new level', async () => {
            const createSpy = jest.spyOn(levelModel, 'create' as never);
            await service.createNewLevel({} as unknown as LevelDto);
            expect(createSpy).toHaveBeenCalledTimes(1);
        });
    });
});

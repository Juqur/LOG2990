import { Message } from '@app/model/schema/message.schema';
import { GameService } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { TestConstants } from '@common/test-constants';
import { Test, TestingModule } from '@nestjs/testing';
import { Level } from 'assets/data/level';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ImageController } from './image.controller';

describe('ImageController', () => {
    let controller: ImageController;
    let imageService: ImageService;
    let gameService: GameService;
    let mongodbService: SinonStubbedInstance<MongodbService>;
    let levels: Level[] = [];

    beforeEach(async () => {
        mongodbService = createStubInstance<MongodbService>(MongodbService);
        const module: TestingModule = await Test.createTestingModule({
            imports: [NestjsFormDataModule],
            controllers: [ImageController],
            providers: [ImageService, GameService, { provide: MongodbService, useValue: mongodbService }],
        }).compile();
        controller = module.get<ImageController>(ImageController);
        imageService = module.get<ImageService>(ImageService);
        gameService = module.get<GameService>(GameService);

        levels = TestConstants.MOCK_LEVELS;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getLevels', () => {
        it('should call getLevels', () => {
            jest.spyOn(gameService, 'getLevelDeletionQueue').mockReturnValue([]);
            const spy = jest.spyOn(mongodbService, 'getAllLevels').mockImplementation(jest.fn());
            controller.getLevels();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should return the levels', async () => {
            jest.spyOn(gameService, 'getLevelDeletionQueue').mockReturnValue([]);
            mongodbService.getAllLevels.resolves(levels);
            const result = await controller.getLevels();
            expect(result).toStrictEqual(levels);
        });

        it('should return undefined if it cannot read the file', async () => {
            jest.spyOn(gameService, 'getLevelDeletionQueue').mockReturnValue([]);
            mongodbService.getAllLevels.resolves(undefined);
            const result = await controller.getLevels();
            expect(result).toBeUndefined();
        });

        it('should set canJoin to true if the level is joinable', async () => {
            jest.spyOn(gameService, 'getLevelDeletionQueue').mockReturnValue([]);
            jest.spyOn(gameService, 'getJoinableLevels').mockReturnValue([1]);
            mongodbService.getAllLevels.resolves(levels);
            const result = await controller.getLevels();
            expect(result[0].canJoin).toEqual(true);
        });

        it('should remove deleted levels from the list', async () => {
            jest.spyOn(gameService, 'getLevelDeletionQueue').mockReturnValue([1]);
            mongodbService.getAllLevels.resolves(levels);
            const result = await controller.getLevels();
            expect(result).toHaveLength(2);
            expect(result[0].id).not.toEqual(1);
            expect(result[0].id).toEqual(2);
        });
    });

    describe('getLevel', () => {
        it('should call getLevel', () => {
            const spy = jest.spyOn(mongodbService, 'getLevelById').mockImplementation(jest.fn());
            controller.getLevel('1');
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should return the levels', async () => {
            mongodbService.getLevelById.resolves(levels[0]);
            const result = await controller.getLevel('1');
            expect(result).toStrictEqual(levels[0]);
        });

        it('should return undefined if the file cannot be found or read', async () => {
            mongodbService.getLevelById.resolves(undefined);
            const result = await controller.getLevel(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('writeLevelData', () => {
        it('should call writeLevelData', () => {
            const spy = jest.spyOn(imageService, 'writeLevelData').mockReturnValue({} as Promise<Message>);
            controller.writeLevelData(TestConstants.MOCK_LEVEL_DATA_1);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should return the appropriate message', async () => {
            const expectedMessage: Message = new Message();
            expectedMessage.body = 'Le jeu a été téléchargé avec succès!';
            expectedMessage.title = 'success';

            imageService.writeLevelData = jest.fn().mockResolvedValue(expectedMessage);
            const result = await controller.writeLevelData(TestConstants.MOCK_LEVEL_DATA_1);
            expect(result).toStrictEqual(expectedMessage);
        });

        it('should add the level to the timed game list', () => {
            const spy = jest.spyOn(imageService, 'writeLevelData').mockReturnValue({ level: {} as Level } as unknown as Promise<Message>);
            controller.writeLevelData(TestConstants.MOCK_LEVEL_DATA_1);
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});

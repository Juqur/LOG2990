import { Message } from '@app/model/schema/message.schema';
import { TestConstants } from '@common/test-constants';
import { Test, TestingModule } from '@nestjs/testing';
import { Level } from 'assets/data/level';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ImageService } from './../../../app/services/image/image.service';
import { ImageController } from './image.controller';

describe('ImageController', () => {
    let controller: ImageController;
    let imageService: ImageService;
    let levels: Level[] = [];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [NestjsFormDataModule],
            controllers: [ImageController],
            providers: [ImageService],
        }).compile();
        controller = module.get<ImageController>(ImageController);
        imageService = module.get<ImageService>(ImageService);

        levels = TestConstants.MOCK_LEVELS;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getLevels', () => {
        it('should call getLevels', () => {
            const spy = jest.spyOn(imageService, 'getLevels').mockImplementation(jest.fn());
            controller.getLevels();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should return the levels', async () => {
            imageService.getLevels = jest.fn().mockResolvedValue(levels);
            const result = await controller.getLevels();
            expect(result).toStrictEqual(levels);
        });

        // We can assume that getLevels will return undefined if it cannot read the file.
        // It is already handled in image service.
        it('should return undefined if it cannot read the file', async () => {
            imageService.getLevels = jest.fn().mockResolvedValue(undefined);
            const result = await controller.getLevels();
            expect(result).toBeUndefined();
        });
    });

    describe('getLevel', () => {
        it('should call getLevel', () => {
            const spy = jest.spyOn(imageService, 'getLevel').mockImplementation(jest.fn());
            controller.getLevel('1');
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should return the levels', async () => {
            imageService.getLevel = jest.fn().mockResolvedValue(levels[0]);
            const result = await controller.getLevel('1');
            expect(result).toStrictEqual(levels[0]);
        });

        it('should return undefined if the file cannot be found or read', async () => {
            imageService.getLevel = jest.fn().mockResolvedValue(undefined);
            const result = await controller.getLevel(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('differenceCount', () => {
        it('should call differenceCount', () => {
            const spy = jest.spyOn(imageService, 'differencesCount').mockImplementation(jest.fn());
            controller.differenceCount('');
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should return the appropriate number of differences', async () => {
            const numDifferences = 10;
            imageService.differencesCount = jest.fn().mockResolvedValue(numDifferences);
            const result = await controller.differenceCount('');
            expect(result).toStrictEqual(numDifferences);
        });

        it('should return undefined if the file cannot be found or read', async () => {
            imageService.differencesCount = jest.fn().mockRejectedValue(undefined);
            const result = await controller.getLevel(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('writeLevelData', () => {
        it('should call writeLevelData', () => {
            const spy = jest.spyOn(imageService, 'writeLevelData').mockImplementation(jest.fn());
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
    });

    describe('deleteLevelData', () => {
        it('should call deleteLevelData', () => {
            const spy = jest.spyOn(imageService, 'deleteLevelData').mockImplementation(jest.fn());
            controller.deleteLevelData('1');
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should return true on success', async () => {
            imageService.deleteLevelData = jest.fn().mockResolvedValue(true);
            const result = await controller.deleteLevelData('1');
            expect(result).toBeTruthy();
        });

        it('should return on failure', async () => {
            imageService.deleteLevelData = jest.fn().mockResolvedValue(false);
            const result = await controller.deleteLevelData('1');
            expect(result).toBeFalsy();
        });
    });
});

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

        it('should return undefined if it cannot read the file', async () => {
            imageService.getLevels = jest.fn().mockRejectedValue(undefined);
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
            imageService.getLevel = jest.fn().mockRejectedValue(undefined);
            const result = await controller.getLevel(undefined);
            expect(result).toBeUndefined();
        });
    });
});

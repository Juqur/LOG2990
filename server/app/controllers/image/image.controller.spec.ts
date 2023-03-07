import { TestConstants } from '@common/test-constants';
import { Test, TestingModule } from '@nestjs/testing';
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
    });
});

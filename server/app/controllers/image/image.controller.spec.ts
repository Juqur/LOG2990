import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './../../../app/services/image/image.service';
import { ImageController } from './image.controller';

describe('ImageController', () => {
    let controller: ImageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImageController],
            providers: [ImageService],
        }).compile();
        controller = module.get<ImageController>(ImageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});

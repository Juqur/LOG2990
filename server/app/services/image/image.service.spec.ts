import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageService],
        }).compile();

        service = module.get<ImageService>(ImageService);
    });

    beforeEach(() => {});

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the correct array of differences', () => {
        const fileName = 'test';
        const position = 1;
        const expectedArray = [1, 2, 3];

        const result = service.findDifference(fileName, position);

        expect(result).toEqual(expectedArray);
    });
});

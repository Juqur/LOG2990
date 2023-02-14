import { TestConstants } from '@common/test-constants';
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

    beforeEach(() => {
        (service as unknown)['pathDifference'] = '../server/assets/test/';
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the mocked value for pathDifference()', () => {
        const result = service['pathDifference'];
        expect(result).toBe('../server/assets/test/');
    });

    it('getArray should read the tested file', () => {
        const expectedArray = [
            [1, 0, 1, 1],
            [1, 1, 1],
            [0, 1, 0],
        ];

        service.getArray('clusters-test').then((result) => {
            expect(result).toStrictEqual(expectedArray);
        });
    });

    it('getArray should throw exception if file does not exist', async () => {
        expect(service.getArray('')).rejects.toThrow();
    });

    it('returnArray should return the correct array', () => {
        const expectedArray = TestConstants.EXPECTED_DIFFERENCE_ARRAY;
        service.getArray('clusters-test1').then((readArray) => {
            service.returnArray(readArray, 1).then((result) => {
                expect(result).toEqual(expectedArray);
            });
        });
    });

    it('returnArray should return an empty array if the passed array is empty', () => {
        const expectedArray: number[] = [];
        const differenceArray: number[][] = [];
        service.returnArray(differenceArray, 1).then((result) => {
            expect(result).toEqual(expectedArray);
        });
    });

    it('returnArray should return an empty array if the position is not found', () => {
        const expectedArray: number[] = [];
        service.getArray('clusters-test1').then((readArray) => {
            service.returnArray(readArray, 0).then((result) => {
                expect(result).toEqual(expectedArray);
            });
        });
    });

    // it('should return the correct array of differences', () => {
    //     const fileName = 'clusters-test';
    //     const position = 1;
    //     const expectedArray = [4, 7, 8, 0];

    //     const result = service.findDifference(fileName, position);

    //     expect(result).toEqual(expectedArray);
    // });
});

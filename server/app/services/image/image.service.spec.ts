import { Constants } from '@common/constants';
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
        const fileName = 'clusters-test';
        const expectedArray = [
            [1, 0, 1, 1],
            [1, 1, 1],
            [0, 1, 0],
        ];

        service.getArray(fileName).then((result) => {
            expect(result).toStrictEqual(expectedArray);
        });
    });

    it('getArray should throw exception if file does not exist', async () => {
        expect(service.getArray('')).rejects.toThrow();
    });

    it('returnArray should return the correct array', () => {
        const fileName = 'clusters-test1';
        const expectedArray = TestConstants.EXPECTED_DIFFERENCE_ARRAY;
        service.getArray(fileName).then((readArray) => {
            const result = service.returnArray(readArray, 1);
            expect(result).toEqual(expectedArray);
        });
    });

    it('returnArray should return undefined if the passed array is empty', () => {
        const differenceArray: number[][] = [];
        const result = service.returnArray(differenceArray, 1);
        expect(result).toEqual(undefined);
    });

    it('returnArray should return undefined if the position is not found', () => {
        service.getArray('clusters-test1').then((readArray) => {
            const result = service.returnArray(readArray, 0);
            expect(result).toEqual(undefined);
        });
    });

    it('findDifference should return the correct array of differences', async () => {
        const fileName = 'clusters-test1';
        const position = 1;
        const expectedArray = TestConstants.EXPECTED_DIFFERENCE_ARRAY;

        const result = await service.findDifference(fileName, position);
        expect(result).toStrictEqual(expectedArray);
    });

    it('findDifference should return [-1] when all differences have been found', async () => {
        const fileName = 'clusters-test1';
        const position = 1;
        const expectedArray = [Constants.minusOne];

        jest.spyOn(service, 'getArray').mockReturnValue(undefined);
        jest.spyOn(service, 'returnArray').mockReturnValue(undefined);

        const result = await service.findDifference(fileName, position);
        expect(result).toStrictEqual(expectedArray);
    });
});

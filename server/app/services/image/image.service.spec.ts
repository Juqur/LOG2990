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

    it('returnIndex should return the correct index', () => {
        const fileName = 'clusters-test1';
        const expectedIndex = 0;
        service.getArray(fileName).then((readArray) => {
            const result = service.returnIndex(readArray, 1);
            expect(result).toStrictEqual(expectedIndex);
        });
    });

    it('returnArray should return undefined if the passed array is empty', () => {
        const differenceArray: number[][] = [];
        const result = service.returnIndex(differenceArray, 1);
        expect(result).toStrictEqual(undefined);
    });

    it('returnArray should return undefined if the position is not found', () => {
        service.getArray('clusters-test1').then((readArray) => {
            const result = service.returnIndex(readArray, 0);
            expect(result).toStrictEqual(undefined);
        });
    });

    it('findDifference should return an empty array if the index is undefined', async () => {
        const fileName = 'clusters-test1';
        const position = undefined;
        const result = await service.findDifference(fileName, position);

        expect(result).toStrictEqual([]);
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
        jest.spyOn(service, 'returnIndex').mockReturnValue(undefined);
        const mockGetFoundDifferences = jest.fn().mockReturnValue(TestConstants.FOUND_DIFFERENCES_TEST);
        Object.defineProperty(service, 'foundDifferences', { get: mockGetFoundDifferences });

        const result = await service.findDifference(fileName, position);
        expect(result).toStrictEqual(expectedArray);
    });
});

import { TestConstants } from '@common/test-constants';
import { Test, TestingModule } from '@nestjs/testing';
import { Level } from 'assets/data/level';
import * as fs from 'fs';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;
    let levels: Level[] = [];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageService],
        }).compile();
        service = module.get<ImageService>(ImageService);
    });

    beforeEach(() => {
        (service as unknown)['pathDifference'] = '../server/assets/test/';
        levels = TestConstants.MOCK_LEVELS;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the mocked value for pathDifference()', () => {
        const result = service['pathDifference'];
        expect(result).toBe('../server/assets/test/');
    });

    describe('getLevels', () => {
        it('should call fsp.readFile', async () => {
            const spy = jest.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            await service.getLevels();
            expect(spy).toHaveBeenCalled();
        });

        it('should return the mocked levels', async () => {
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            const result = await service.getLevels();
            expect(result).toEqual(levels);
        });

        it('should return undefined if it cannot read the file', async () => {
            fs.promises.readFile = jest.fn().mockRejectedValue(undefined);
            const result = await service.getLevels();
            expect(result).toBeUndefined();
        });
    });

    describe('getLevel', () => {
        it('should call fsp.readFile', async () => {
            const spy = jest.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            await service.getLevel(1);
            expect(spy).toHaveBeenCalled();
        });

        it('should return the mocked level', async () => {
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            const result = await service.getLevel(1);
            expect(result).toEqual(levels[0]);
        });

        it('should return undefined if it cannot read the file', async () => {
            fs.promises.readFile = jest.fn().mockRejectedValue(undefined);
            const result = await service.getLevel(1);
            expect(result).toBeUndefined();
        });

        it('should return undefined if the level does not exist', async () => {
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            const result = await service.getLevel(0);
            expect(result).toBeUndefined();
        });
    });

    describe('differencesCount', () => {
        it('should call fsp.readFile', async () => {
            const spy = jest.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from(JSON.stringify(TestConstants.CLUSTERS_TEST1)));
            await service.differencesCount('');
            expect(spy).toHaveBeenCalled();
        });

        it('should return the correct number of differences', async () => {
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(TestConstants.CLUSTERS_TEST1)));
            const result = await service.differencesCount('');
            expect(result).toEqual(TestConstants.CLUSTERS_TEST1.length);
        });

        it('should return undefined if the file does not exist', async () => {
            fs.promises.readFile = jest.fn().mockRejectedValue(undefined);
            const result = await service.differencesCount('');
            expect(result).toBeUndefined();
        });
    });

    describe('getAllDifferences', () => {
        it('should call fsp.readFile', async () => {
            const spy = jest.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from(JSON.stringify(TestConstants.CLUSTERS_TEST1)));
            await service.getAllDifferences('');
            expect(spy).toHaveBeenCalled();
        });

        it('should return the correct array', async () => {
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(TestConstants.CLUSTERS_TEST1)));
            const result = await service.getAllDifferences('');
            expect(result).toEqual(TestConstants.CLUSTERS_TEST1);
        });

        it('should return undefined if the file does not exist', async () => {
            fs.promises.readFile = jest.fn().mockRejectedValue(undefined);
            const result = await service.getAllDifferences('');
            expect(result).toBeUndefined();
        });
    });

    describe('getIndex', () => {
        it('should return the correct index', () => {
            const foundDifferences = [];
            const index = service.getIndex(TestConstants.CLUSTERS_TEST1, foundDifferences, 0);
            expect(foundDifferences).toEqual([0]);
            expect(index).toEqual(0);
        });

        it('should return undefined if the difference cannot be found', () => {
            const foundDifferences = [];
            const index = service.getIndex(TestConstants.CLUSTERS_TEST1, foundDifferences, 1);
            expect(foundDifferences).toEqual([]);
            expect(index).toBeUndefined();
        });
    });

    describe('findDifference', () => {
        it('should return the correct array that contains the selected index', async () => {
            const foundDifferences = [];
            jest.spyOn(service, 'getAllDifferences').mockResolvedValue(TestConstants.CLUSTERS_TEST1);
            jest.spyOn(service, 'getIndex').mockReturnValue(0);
            const result = await service.findDifference('', foundDifferences, 0);
            expect(result).toStrictEqual(TestConstants.CLUSTERS_TEST1[0]);
        });

        it('should return an empty array if the index is undefined', async () => {
            jest.spyOn(service, 'getAllDifferences').mockResolvedValue(TestConstants.CLUSTERS_TEST1);
            jest.spyOn(service, 'getIndex').mockReturnValue(undefined);

            const position = undefined;
            const result = await service.findDifference('', [], position);
            expect(result).toStrictEqual([]);
        });
    });

    describe('writeLevelData', () => {
        it('should return the correct message', async () => {
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            fs.promises.writeFile = jest.fn();
            service['handleErrors'] = jest.fn();
            jest.spyOn(fs, 'writeFile').mockImplementation((path, data, cb) => {
                cb(new Error('Failed to rename file'));
            });
            jest.spyOn(fs, 'rename').mockImplementation((oldPath, newPath, cb) => {
                cb(new Error('Failed to rename file'));
            });

            let message = await service.writeLevelData(TestConstants.MOCK_LEVEL_DATA_1);
            expect(message.title).toEqual('success');
            message = await service.writeLevelData(TestConstants.MOCK_LEVEL_DATA_2);
            expect(message.title).toEqual('success');
        });
    });

    describe('handleErrors', () => {
        it('handleErrors should return the correct error message', () => {
            const error = new Error('skill issue');
            const message = service['handleErrors'](error);
            expect(message.title).toEqual('error');
            expect(message.body).toEqual('Échec du téléchargement du jeu. Veuillez réessayer plus tard. \nErreur: skill issue');
        });
    });
});

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
        it('should call getLevels', async () => {
            const spy = jest.spyOn(service, 'getLevels').mockResolvedValue(levels);
            await service.getLevel(1);
            expect(spy).toHaveBeenCalled();
        });

        it('should return the mocked level', async () => {
            service.getLevels = jest.fn().mockResolvedValue(levels);
            const result = await service.getLevel(1);
            expect(result).toEqual(levels[0]);
        });

        it('should return undefined if it cannot read the file', async () => {
            service.getLevels = jest.fn().mockRejectedValue(undefined);
            const result = await service.getLevel(1);
            expect(result).toBeUndefined();
        });

        it('should return undefined if the level does not exist', async () => {
            service.getLevels = jest.fn().mockResolvedValue(levels);
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
        const mockSyncWrite = jest.spyOn(fs, 'writeFile');
        const mockSyncRename = jest.spyOn(fs, 'rename');

        beforeEach(() => {
            mockSyncWrite.mockImplementation();
            mockSyncRename.mockImplementation();
            service['confirmUpload'] = jest.fn().mockResolvedValue('success');
            service['handleErrors'] = jest.fn().mockImplementation((error) => error);
        });

        it('should call confirmUpload on normal use case', async () => {
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            fs.promises.writeFile = jest.fn();

            const result = await service.writeLevelData(TestConstants.MOCK_LEVEL_DATA_1);
            expect(service['confirmUpload']).toHaveBeenCalledTimes(1);
            expect(service['handleErrors']).not.toHaveBeenCalled();
            expect(result).toEqual('success');
        });

        it('should return an error message if the file cannot be found', async () => {
            fs.promises.readFile = jest.fn().mockRejectedValue(new Error('file cannot be read'));
            fs.promises.writeFile = jest.fn();

            const result = await service.writeLevelData(TestConstants.MOCK_LEVEL_DATA_1);
            expect(service['confirmUpload']).not.toHaveBeenCalled();
            expect(service['handleErrors']).toHaveBeenCalledTimes(1);
            expect(result).toBeInstanceOf(Error);
        });

        it('should return an error message when writing the file is a failure', async () => {
            const error = new Error('Failed to write file');
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            fs.promises.writeFile = jest.fn();
            mockSyncWrite.mockImplementation((path, data, callback) => {
                callback(error);
            });

            const result = await service.writeLevelData(TestConstants.MOCK_LEVEL_DATA_1);
            expect(service['confirmUpload']).not.toHaveBeenCalled();
            expect(service['handleErrors']).toHaveBeenCalledTimes(1);
            expect(result).toEqual(error);
        });

        it('should return an error message when rename original image is a failure', async () => {
            const error = new Error('Failed to rename file');
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            fs.promises.writeFile = jest.fn();
            mockSyncRename.mockImplementation((path, data, callback) => {
                callback(error);
            });

            const result = await service.writeLevelData(TestConstants.MOCK_LEVEL_DATA_1);
            expect(service['confirmUpload']).not.toHaveBeenCalled();
            expect(service['handleErrors']).toHaveBeenCalledTimes(1);
            expect(result).toEqual(error);
        });

        it('should return an error message when rename modified image is a failure', async () => {
            const error = new Error('Failed to rename file');
            fs.promises.readFile = jest.fn().mockResolvedValue(Buffer.from(JSON.stringify(levels)));
            fs.promises.writeFile = jest.fn();
            mockSyncRename.mockImplementationOnce(jest.fn());
            mockSyncRename.mockImplementation((path, data, callback) => {
                callback(error);
            });

            const result = await service.writeLevelData(TestConstants.MOCK_LEVEL_DATA_1);
            expect(service['confirmUpload']).not.toHaveBeenCalled();
            expect(service['handleErrors']).toHaveBeenCalledTimes(1);
            expect(result).toEqual(error);
        });
    });

    describe('deleteLevelData', () => {
        const levelId = 1;
        const mockSyncUnlink = jest.spyOn(fs, 'unlink');
        let spyGetLevel: jest.SpyInstance;
        let spyGetLevels: jest.SpyInstance;

        beforeEach(() => {
            mockSyncUnlink.mockImplementation();
            spyGetLevel = jest.spyOn(service, 'getLevel').mockResolvedValue(levels.find((item) => item.id === levelId));
            spyGetLevels = jest.spyOn(service, 'getLevels').mockResolvedValue(levels);
            fs.promises.writeFile = jest.fn();
        });

        it('should call getLevel', async () => {
            await service.deleteLevelData(levelId);
            expect(spyGetLevel).toHaveBeenCalledTimes(1);
        });

        it('should call getLevels', async () => {
            await service.deleteLevelData(levelId);
            expect(spyGetLevels).toHaveBeenCalledTimes(1);
        });

        it('should call unlink', async () => {
            await service.deleteLevelData(levelId);
            expect(mockSyncUnlink).toHaveBeenCalled();
        });

        it('should call writeFile', async () => {
            await service.deleteLevelData(levelId);
            expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
        });

        it('should return true on normal use case', async () => {
            const result = await service.deleteLevelData(levelId);
            expect(result).toBeTruthy();
        });

        it('should return false if the level does not exist', async () => {
            spyGetLevel.mockResolvedValue(undefined);
            const result = await service.deleteLevelData(levelId);
            expect(result).toBeFalsy();
        });

        it('should return false if an error is being raised', async () => {
            const error = new Error('Failed to write file');
            fs.promises.writeFile = jest.fn().mockRejectedValue(error);
            const result = await service.deleteLevelData(levelId);
            expect(result).toBeFalsy();
        });

        it('should return false when unlink fails', async () => {
            const error = new Error('Failed to write file');
            mockSyncUnlink.mockImplementationOnce((path, callback) => {
                callback(error);
            });
            let result = await service.deleteLevelData(levelId);
            expect(result).toBeFalsy();

            mockSyncUnlink.mockImplementationOnce(jest.fn()).mockImplementationOnce((path, callback) => {
                callback(error);
            });
            result = await service.deleteLevelData(levelId);
            expect(result).toBeFalsy();

            mockSyncUnlink
                .mockImplementationOnce(jest.fn())
                .mockImplementationOnce(jest.fn())
                .mockImplementationOnce((path, callback) => {
                    callback(error);
                });
            result = await service.deleteLevelData(levelId);
            expect(result).toBeFalsy();
        });
    });

    describe('confirmUpload', () => {
        it('should return the correct message', () => {
            expect(service['confirmUpload']().title).toStrictEqual('success');
        });
    });

    describe('handleErrors', () => {
        it('should return the correct error message', () => {
            const error = new Error('skill issue');
            const message = service['handleErrors'](error);
            expect(message.title).toEqual('error');
            expect(message.body).toEqual('Échec du téléchargement du jeu. Veuillez réessayer plus tard. \nErreur: ' + error.message);
        });
    });
});

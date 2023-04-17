import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { TestConstants } from '@common/test-constants';
import { Test, TestingModule } from '@nestjs/testing';
import { Level } from 'assets/data/level';
import * as fs from 'fs';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;
    let mongodbService: SinonStubbedInstance<MongodbService>;
    let levels: Level[] = [];

    beforeEach(async () => {
        mongodbService = createStubInstance<MongodbService>(MongodbService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImageService,
                {
                    provide: MongodbService,
                    useValue: mongodbService,
                },
            ],
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
            const expected = { differencePixels: TestConstants.CLUSTERS_TEST1[0], totalDifferences: TestConstants.CLUSTERS_TEST1.length };
            const foundDifferences = [];
            jest.spyOn(service, 'getAllDifferences').mockResolvedValue(TestConstants.CLUSTERS_TEST1);
            jest.spyOn(service, 'getIndex').mockReturnValue(0);
            const result = await service.findDifference('', foundDifferences, 0);
            expect(result).toStrictEqual(expected);
        });

        it('should return an empty array if the index is undefined', async () => {
            const expected = { differencePixels: [], totalDifferences: TestConstants.CLUSTERS_TEST1.length };
            jest.spyOn(service, 'getAllDifferences').mockResolvedValue(TestConstants.CLUSTERS_TEST1);
            jest.spyOn(service, 'getIndex').mockReturnValue(undefined);
            const position = undefined;
            const result = await service.findDifference('', [], position);
            expect(result).toStrictEqual(expected);
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

        beforeEach(() => {
            const returnLevel = levels.find((item) => {
                if (item.id === levelId) return item;
            });
            mockSyncUnlink.mockImplementation();
            spyGetLevel = jest.spyOn(mongodbService, 'getLevelById').mockResolvedValue(returnLevel);
            fs.promises.writeFile = jest.fn();
        });

        it('should call getLevel', async () => {
            await service.deleteLevelData(levelId);
            expect(spyGetLevel).toHaveBeenCalledTimes(1);
        });

        it('should call unlink', async () => {
            await service.deleteLevelData(levelId);
            expect(mockSyncUnlink).toHaveBeenCalled();
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
            expect(service['confirmUpload']({} as Level).title).toStrictEqual('success');
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

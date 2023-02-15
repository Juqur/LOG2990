import { Message } from '@app/model/schema/message.schema';
import { Constants } from '@common/constants';
import { TestConstants } from '@common/test-constants';
import { Test, TestingModule } from '@nestjs/testing';
import { Level, LevelData } from 'assets/data/level';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import { FileSystemStoredFile } from 'nestjs-form-data';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;
    let levels: Level[] = [];
    const differences = [
        [1, 1],
        [1, 1],
        [1, 1],
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageService],
        }).compile();
        service = module.get<ImageService>(ImageService);
    });

    beforeEach(() => {
        (service as unknown)['pathDifference'] = '../server/assets/test/';
        const level = {
            id: 1,
            name: '',
            playerMulti: [],
            playerSolo: [],
            timeMulti: [],
            timeSolo: [],
            isEasy: false,
            nbDifferences: 0,
        };
        const level2 = level;
        level2.id = 2;
        levels = [level, level2, level];
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
            const result = service.returnIndex(readArray, [], 1);
            expect(result).toStrictEqual(expectedIndex);
        });
    });

    it('returnArray should return undefined if the passed array is empty', () => {
        const differenceArray: number[][] = [];
        const result = service.returnIndex(differenceArray, [], 1);
        expect(result).toStrictEqual(undefined);
    });

    it('returnArray should return undefined if the position is not found', () => {
        service.getArray('clusters-test1').then((readArray) => {
            const result = service.returnIndex(readArray, [], 0);
            expect(result).toStrictEqual(undefined);
        });
    });

    it('findDifference should return an empty array if the index is undefined', async () => {
        const fileName = 'clusters-test1';
        const position = undefined;
        const result = await service.findDifference(fileName, [], position);

        expect(result).toStrictEqual([]);
    });

    it('findDifference should return the correct array of differences', async () => {
        const fileName = 'clusters-test1';
        const position = 1;
        const expectedArray = TestConstants.EXPECTED_DIFFERENCE_ARRAY;

        const result = await service.findDifference(fileName, [], position);
        expect(result).toStrictEqual(expectedArray);
    });

    it('findDifference should return [-1] when all differences have been found', async () => {
        const fileName = 'clusters-test1';
        const position = 1;
        const expectedArray = [Constants.minusOne];
        const foundDifferences = TestConstants.FOUND_DIFFERENCES_TEST;
        jest.spyOn(service, 'returnIndex').mockReturnValue(undefined);

        const result = await service.findDifference(fileName, foundDifferences, position);
        expect(result).toStrictEqual(expectedArray);
    });

    it('should return an array of Level objects when calling getLevels', async () => {
        jest.spyOn(fsp, 'readFile').mockResolvedValue(JSON.stringify(levels));
        const result = await service.getLevels();

        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toEqual(levels.length);
        expect(result[0].name).toEqual(levels[0].name);
    });

    it('should return a specific Level object when calling getLevel according to the id', async () => {
        jest.spyOn(fsp, 'readFile').mockResolvedValue(JSON.stringify(levels));
        const result = await service.getLevel(2);

        expect(result.id).toEqual(2);
    });

    it('should return the number of differences in the file', async () => {
        jest.spyOn(fsp, 'readFile').mockResolvedValue(JSON.stringify(differences));
        const result = await service.differencesCount('name');
        expect(result).toEqual(differences.length);
    });

    it('should create a new file with the differences', async () => {
        const mockLevelData: LevelData = {
            name: 'Test level',
            imageOriginal: new FileSystemStoredFile(),
            imageDiff: new FileSystemStoredFile(),
            nbDifferences: 10,
            isEasy: 'true',
            clusters: [
                [1, 1],
                [1, 1],
            ],
        };
        const mockPromises =
            '{"id":1,"name":"Test","playerSolo":["Bot1","Bot2","Bot3"],"timeSolo":20,"playerMulti":["Bot1","Bot2","Bot3"],' +
            '"timeMulti":20,"isEasy":false,"nbDifferences":2}';
        // const mockLevels: Level[] = JSON.parse(mockPromises);
        jest.spyOn(JSON, 'parse').mockReturnValue([mockLevelData]);
        const mockMessage: Message = new Message();
        mockMessage.body = 'Le jeu a été téléchargé avec succès!';
        mockMessage.title = 'success';
        jest.spyOn(fsp, 'readFile').mockResolvedValue(mockPromises);
        jest.spyOn(fs, 'writeFile').mockImplementation((path, data, callback) => {
            callback(null);
        });
        jest.spyOn(fs, 'rename').mockImplementation((oldPath, newPath, callback) => {
            callback(null);
        });
        const result = await service.writeLevelData(mockLevelData);
        expect(result).toEqual(mockMessage);
    });

    it('should return a Message object with an error title and body', () => {
        const error = new Error('erreur');
        const result = service.handleErrors(error);
        expect(result).toBeInstanceOf(Message);

        expect(result.title).toBe('error');
        expect(result.body).toBe(`Échec du téléchargement du jeu. Veuillez réessayer plus tard. \nErreur:${error.message}`);
    });
});

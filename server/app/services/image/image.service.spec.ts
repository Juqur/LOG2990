import { Message } from '@app/model/schema/message.schema';
import { Constants } from '@common/constants';
import { TestConstants } from '@common/test-constants';
import { Test, TestingModule } from '@nestjs/testing';
import { Level } from 'assets/data/level';
import { promises as fsp } from 'fs';
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

    it('should return an array of Level objects when calling getLevels', async () => {
        jest.spyOn(fsp, 'readFile').mockResolvedValue(JSON.stringify(levels));
        const result = await service.getLevels();

        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toEqual(levels.length);
        expect(result[0].name).toEqual(levels[0].name);
    });

    it('should return the number of differences in the file', async () => {
        jest.spyOn(fsp, 'readFile').mockResolvedValue(JSON.stringify(differences));
        const result = await service.differencesCount('name');
        expect(result).toEqual(differences.length);
    });

    it('should return a Message object with an error title and body', () => {
        const error = new Error('erreur');
        const result = service.handleErrors(error);
        expect(result).toBeInstanceOf(Message);

        expect(result.title).toBe('error');
        expect(result.body).toBe(`Échec du téléchargement du jeu. Veuillez réessayer plus tard. \nErreur:${error.message}`);
    });
});

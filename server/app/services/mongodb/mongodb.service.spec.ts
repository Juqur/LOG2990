/* eslint-disable max-lines */

/**
 * This test file draws inspiration from the following git repository:
 * https://github.com/jmcdo29/testing-nestjs/blob/main/apps/mongo-sample/src/cat/cat.service.spec.ts
 */

import { GameConstants, GameConstantsDocument } from '@app/model/schema/game-constants.schema';
import { GameHistory, GameHistoryDocument } from '@app/model/schema/game-history.schema';
import { Level, LevelDocument } from '@app/model/schema/level.schema';
import { GameState } from '@app/services/game/game.service';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { Constants } from '@common/constants';
import { Level as LevelDto } from '@common/interfaces/level';
import { TestConstants } from '@common/test-constants';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Query } from 'mongoose';

const mockLevel = (
    id = 1,
    name = 'juan cena',
    playerSolo = TestConstants.PLAYER_ARRAY_SOLO_DATA_BASE,
    timeSolo = TestConstants.TIME_ARRAY_SOLO_DATA_BASE,
    playerMulti = TestConstants.PLAYER_ARRAY_MULTI_DATA_BASE,
    timeMulti = TestConstants.TIME_ARRAY_MULTI_DATA_BASE,
    isEasy = true,
    nbDifferences = TestConstants.EXPECTED_DIFFERENCES,
    canJoin = true,
    // eslint-disable-next-line max-params
): Level => ({
    id,
    name,
    playerSolo,
    timeSolo,
    playerMulti,
    timeMulti,
    isEasy,
    nbDifferences,
    canJoin,
});

// const mockGameHistory = (
//     startDate = TestConstants.DATE_ARRAY[0],
//     lengthGame = TestConstants.NEW_BEST_TIME,
//     isClassic = true,
//     firstPlayerName = 'Mugiwara no Luffy',
//     secondPlayerName = 'Roronoa Zoro',
//     hasPlayerAbandoned = false,
//     // eslint-disable-next-line max-params
// ): GameHistory => ({
//     startDate,
//     lengthGame,
//     isClassic,
//     firstPlayerName,
//     secondPlayerName,
//     hasPlayerAbandoned,
// });

const mockGameConstants = (
    initialTime = Constants.INIT_COUNTDOWN_TIME,
    timePenaltyHint = Constants.HINT_PENALTY,
    timeGainedDifference = Constants.COUNTDOWN_TIME_WIN,
): GameConstants => ({
    initialTime,
    timePenaltyHint,
    timeGainedDifference,
});

const mockLevelDoc = (mock?: Partial<Level>): Partial<LevelDocument> => ({
    id: mock?.id || 1,
    name: mock?.name || 'juan cena',
    playerSolo: mock?.playerSolo || TestConstants.PLAYER_ARRAY_SOLO_DATA_BASE,
    timeSolo: mock?.timeSolo || TestConstants.TIME_ARRAY_SOLO_DATA_BASE,
    playerMulti: mock?.playerMulti || TestConstants.PLAYER_ARRAY_MULTI_DATA_BASE,
    timeMulti: mock?.timeMulti || TestConstants.TIME_ARRAY_MULTI_DATA_BASE,
    isEasy: typeof mock?.isEasy !== 'undefined' ? mock?.isEasy : true,
    nbDifferences: mock?.nbDifferences || TestConstants.EXPECTED_DIFFERENCES,
    canJoin: typeof mock?.canJoin !== 'undefined' ? mock?.canJoin : true,
});

// const mockGameHistoryDoc = (mock?: Partial<GameHistory>): Partial<GameHistoryDocument> => ({
//     startDate: mock?.startDate || TestConstants.DATE_ARRAY[0],
//     lengthGame: mock?.lengthGame || TestConstants.NEW_BEST_TIME,
//     isClassic: typeof mock?.isClassic !== 'undefined' ? mock?.isClassic : true,
//     firstPlayerName: mock?.firstPlayerName || 'Mugiwara no Luffy',
//     secondPlayerName: mock?.secondPlayerName || 'Roronoa Zoro',
//     hasPlayerAbandoned: typeof mock?.hasPlayerAbandoned !== 'undefined' ? mock?.hasPlayerAbandoned : false,
// });

const mockGameConstantsDoc = (mock?: Partial<GameConstants>): Partial<GameConstants> => ({
    initialTime: mock?.initialTime || Constants.INIT_COUNTDOWN_TIME,
    timePenaltyHint: mock?.timePenaltyHint || Constants.HINT_PENALTY,
    timeGainedDifference: mock?.timeGainedDifference || Constants.COUNTDOWN_TIME_WIN,
});

const levelArray = [
    mockLevel(),
    mockLevel(
        2,
        'soccer',
        TestConstants.PLAYER_ARRAY_SOLO_DATA_BASE,
        TestConstants.TIME_ARRAY_SOLO_DATA_BASE,
        TestConstants.PLAYER_ARRAY_MULTI_DATA_BASE,
        TestConstants.TIME_ARRAY_MULTI_DATA_BASE,
        false,
        TestConstants.HARD_LEVEL_NB_DIFFERENCES,
        true,
    ),
    mockLevel(
        3,
        'mirage',
        TestConstants.PLAYER_ARRAY_SOLO_DATA_BASE,
        TestConstants.TIME_ARRAY_SOLO_DATA_BASE,
        TestConstants.PLAYER_ARRAY_MULTI_DATA_BASE,
        TestConstants.TIME_ARRAY_MULTI_DATA_BASE,
        true,
        TestConstants.EXPECTED_DIFFERENCES,
        false,
    ),
];

// const gameHistoryArray = [
//     mockGameHistory(),
//     mockGameHistory(TestConstants.DATE_ARRAY[1], TestConstants.NOT_NEW_BEST_TIME, false, 'Nami', 'God Usopp', false),
//     mockGameHistory(TestConstants.DATE_ARRAY[2], TestConstants.NEW_BEST_TIME, true, 'Vinsmoke Sanji', 'Tony Tony Chopper', true),
// ];

const gameConstantsArray = [mockGameConstants()];

const levelDocArray = [
    mockLevelDoc(),
    mockLevelDoc({
        id: 2,
        name: 'soccer',
        playerSolo: TestConstants.PLAYER_ARRAY_SOLO_DATA_BASE,
        timeSolo: TestConstants.TIME_ARRAY_SOLO_DATA_BASE,
        playerMulti: TestConstants.PLAYER_ARRAY_MULTI_DATA_BASE,
        timeMulti: TestConstants.TIME_ARRAY_MULTI_DATA_BASE,
        isEasy: false,
        nbDifferences: TestConstants.HARD_LEVEL_NB_DIFFERENCES,
        canJoin: true,
    }),
    mockLevelDoc({
        id: 3,
        name: 'mirage',
        playerSolo: TestConstants.PLAYER_ARRAY_SOLO_DATA_BASE,
        timeSolo: TestConstants.TIME_ARRAY_SOLO_DATA_BASE,
        playerMulti: TestConstants.PLAYER_ARRAY_MULTI_DATA_BASE,
        timeMulti: TestConstants.TIME_ARRAY_MULTI_DATA_BASE,
        isEasy: true,
        nbDifferences: TestConstants.EXPECTED_DIFFERENCES,
        canJoin: false,
    }),
];

// const gameHistoryDocArray = [
//     mockGameHistoryDoc(),
//     mockGameHistoryDoc({
//         startDate: TestConstants.DATE_ARRAY[1],
//         lengthGame: TestConstants.NOT_NEW_BEST_TIME,
//         isClassic: false,
//         firstPlayerName: 'Nami',
//         secondPlayerName: 'God Usopp',
//         hasPlayerAbandoned: false,
//     }),
//     mockGameHistoryDoc({
//         startDate: TestConstants.DATE_ARRAY[2],
//         lengthGame: TestConstants.NEW_BEST_TIME,
//         isClassic: true,
//         firstPlayerName: 'Vinsmoke Sanji',
//         secondPlayerName: 'Tony Tony Chopper',
//         hasPlayerAbandoned: true,
//     }),
// ];

const gameConstantsDocArray = [mockGameConstantsDoc()];

describe('MongodbService', () => {
    let service: MongodbService;
    let levelModel: Model<LevelDocument>;
    let gameHistoryModel: Model<GameHistoryDocument>;
    let gameConstantsModel: Model<GameConstantsDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MongodbService,
                {
                    provide: getModelToken(Level.name),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockLevel()),
                        constructor: jest.fn().mockResolvedValue(mockLevel()),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        deleteOne: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        update: jest.fn(),
                        create: jest.fn(),
                        remove: jest.fn(),
                        exec: jest.fn(),
                    },
                },
                {
                    provide: getModelToken(GameHistory.name),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockLevel()),
                        constructor: jest.fn().mockResolvedValue(mockLevel()),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        deleteOne: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        update: jest.fn(),
                        create: jest.fn(),
                        remove: jest.fn(),
                        exec: jest.fn(),
                    },
                },
                {
                    provide: getModelToken(GameConstants.name),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockLevel()),
                        constructor: jest.fn().mockResolvedValue(mockLevel()),
                        find: jest.fn().mockReturnValue({
                            exec: jest.fn().mockResolvedValue([]),
                        }),
                        findOne: jest.fn(),
                        deleteOne: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        update: jest.fn(),
                        create: jest.fn(),
                        remove: jest.fn(),
                        exec: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<MongodbService>(MongodbService);
        levelModel = module.get<Model<LevelDocument>>(getModelToken(Level.name));
        gameHistoryModel = module.get<Model<GameHistoryDocument>>(getModelToken(GameHistory.name));
        gameConstantsModel = module.get<Model<GameConstantsDocument>>(getModelToken(GameConstants.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createNewLevel', () => {
        it('should create a new level', async () => {
            const createSpy = jest.spyOn(levelModel, 'create' as never);
            await service.createNewLevel({} as unknown as LevelDto);
            expect(createSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('deleteLevel', () => {
        it('should delete a level', async () => {
            const levelId = 1;
            const deleteOneSpy = jest.spyOn(levelModel, 'deleteOne').mockReturnValue({
                exec: jest.fn(),
            } as never);
            await service.deleteLevel(levelId);
            expect(deleteOneSpy).toHaveBeenCalledWith({ id: levelId });
        });
    });

    describe('getAllLevels', () => {
        it('should return all levels', async () => {
            jest.spyOn(levelModel, 'find').mockReturnValue({
                exec: jest.fn().mockReturnValue(levelDocArray),
            } as never);
            const result = await service.getAllLevels();
            expect(result).toEqual(levelArray);
        });
    });

    describe('getLevelById', () => {
        it('should return the correct level', async () => {
            const levelId = 2;
            jest.spyOn(levelModel, 'findOne').mockReturnValue({
                exec: jest.fn().mockReturnValue(levelDocArray[1]),
            } as never);
            const result = await service.getLevelById(levelId);
            expect(result).toEqual(levelArray[1]);
        });
    });

    describe('getLastLevelId', () => {
        it('should correctly return the last level id', async () => {
            const expectedResult = levelArray[2].id;
            jest.spyOn(levelModel, 'findOne').mockReturnValue({} as unknown as Query<LevelDocument[], LevelDocument>);
            jest.spyOn(levelModel, 'find').mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        exec: jest.fn().mockReturnValue([levelDocArray[2]]),
                    }),
                }),
            } as never);
            const result = await service.getLastLevelId();
            expect(result).toEqual(expectedResult);
        });

        it('should correctly catch the error if findOne fails', async () => {
            const error = new Error('Failed to find a level');
            jest.spyOn(levelModel, 'findOne').mockRejectedValue(error);
            jest.spyOn(service, 'handleErrors' as never).mockReturnValue(false as never);
            jest.spyOn(levelModel, 'find').mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        exec: jest.fn().mockReturnValue([levelDocArray[2]]),
                    }),
                }),
            } as never);
            const result = await service.getLastLevelId();
            expect(result).toBeFalsy();
        });

        it('should correctly return 0 if there are no level in the db', async () => {
            const expectedResult = 0;
            jest.spyOn(levelModel, 'findOne').mockReturnValue(null);
            jest.spyOn(levelModel, 'find').mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        exec: jest.fn().mockReturnValue([levelDocArray[2]]),
                    }),
                }),
            } as never);
            const result = await service.getLastLevelId();
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getTimeSoloArray', () => {
        it('should correctly return the time solo array', async () => {
            const levelId = 1;
            const expectedResult = levelArray[0].timeSolo;
            jest.spyOn(levelModel, 'findOne').mockReturnValue({
                exec: jest.fn().mockReturnValue(levelDocArray[0]),
            } as never);
            const result = await service.getTimeSoloArray(levelId);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getPlayerSoloArray', () => {
        it('should correctly return the player solo array', async () => {
            const levelId = 1;
            const expectedResult = levelArray[0].playerSolo;
            jest.spyOn(levelModel, 'findOne').mockReturnValue({
                exec: jest.fn().mockReturnValue(levelDocArray[0]),
            } as never);
            const result = await service.getPlayerSoloArray(levelId);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getTimeMultiArray', () => {
        it('should correctly return the time multi array', async () => {
            const levelId = 1;
            const expectedResult = levelArray[0].timeMulti;
            jest.spyOn(levelModel, 'findOne').mockReturnValue({
                exec: jest.fn().mockReturnValue(levelDocArray[0]),
            } as never);
            const result = await service.getTimeMultiArray(levelId);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getPlayerMultiArray', () => {
        it('should correctly return the player multi array', async () => {
            const levelId = 1;
            const expectedResult = levelArray[0].playerMulti;
            jest.spyOn(levelModel, 'findOne').mockReturnValue({
                exec: jest.fn().mockReturnValue(levelDocArray[0]),
            } as never);
            const result = await service.getPlayerMultiArray(levelId);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('addGameHistory', () => {
        it('should call create', async () => {
            const createSpy = jest.spyOn(gameHistoryModel, 'create' as never);
            await service.addGameHistory({} as unknown as GameHistory);
            expect(createSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateHighScores', () => {
        let gameSate: GameState;
        let endTime: number;

        beforeEach(() => {
            gameSate = {
                levelId: 1,
                foundDifferences: [0, 1],
                amountOfDifferencesFound: 2,
                playerName: 'Bon Jovi',
                isInGame: true,
                isGameFound: true,
                otherSocketId: '123456789',
                isInCheatMode: false,
            } as GameState;

            jest.spyOn(service, 'getLevelById').mockReturnValue({
                exec: jest.fn().mockReturnValue(levelDocArray[0]),
            } as never);

            endTime = TestConstants.NEW_BEST_TIME;
        });

        it('should call getPlayerMultiArray and getTimeMultiArray if in multiplayer mode', async () => {
            const getPlayerMultiArraySpy = jest.spyOn(service, 'getPlayerMultiArray').mockResolvedValue(levelArray[0].playerMulti);
            const getTimeMultiArray = jest.spyOn(service, 'getTimeMultiArray').mockResolvedValue(levelArray[0].timeMulti);
            endTime = TestConstants.NOT_NEW_BEST_TIME;
            await service.updateHighscore(endTime, gameSate);
            expect(getPlayerMultiArraySpy).toHaveBeenCalledTimes(1);
            expect(getTimeMultiArray).toHaveBeenCalledTimes(1);
        });

        it('should call getPlayerSoloArray and getTimeSoloArray if in solo mode', async () => {
            const getPlayerSoloArraySpy = jest.spyOn(service, 'getPlayerSoloArray').mockResolvedValue(levelArray[0].playerSolo);
            const getTimeSoloArray = jest.spyOn(service, 'getTimeSoloArray').mockResolvedValue(levelArray[0].timeSolo);
            endTime = TestConstants.NOT_NEW_BEST_TIME;
            gameSate.otherSocketId = undefined;
            await service.updateHighscore(endTime, gameSate);
            expect(getPlayerSoloArraySpy).toHaveBeenCalledTimes(1);
            expect(getTimeSoloArray).toHaveBeenCalledTimes(1);
        });

        it('should not update solo if not new high score', async () => {
            jest.spyOn(service, 'getPlayerSoloArray').mockResolvedValue(levelArray[0].playerSolo);
            jest.spyOn(service, 'getTimeSoloArray').mockResolvedValue(levelArray[0].timeSolo);
            const findOneAndUpdateSpy = jest.spyOn(levelModel, 'findOneAndUpdate').mockReturnValue({
                exec: jest.fn(),
            } as never);
            endTime = TestConstants.NOT_NEW_BEST_TIME;
            gameSate.otherSocketId = undefined;
            await service.updateHighscore(endTime, gameSate);
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it('should not update multi if not new high score', async () => {
            jest.spyOn(service, 'getPlayerMultiArray').mockResolvedValue(levelArray[0].playerMulti);
            jest.spyOn(service, 'getTimeMultiArray').mockResolvedValue(levelArray[0].timeMulti);
            const findOneAndUpdateSpy = jest.spyOn(levelModel, 'findOneAndUpdate').mockReturnValue({
                exec: jest.fn(),
            } as never);
            endTime = TestConstants.NOT_NEW_BEST_TIME;
            await service.updateHighscore(endTime, gameSate);
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it('should correctly update solo', async () => {
            const levelId = 1;
            const expectedSoloNames = ['Bon Jovi', levelArray[0].playerSolo[0], levelArray[0].playerSolo[1]];
            const expectedSoloTimes = [endTime, levelArray[0].timeSolo[0], levelArray[0].timeSolo[1]];
            jest.spyOn(service, 'getPlayerSoloArray').mockResolvedValue(levelArray[0].playerSolo);
            jest.spyOn(service, 'getTimeSoloArray').mockResolvedValue(levelArray[0].timeSolo);
            const findOneAndUpdateSpy = jest.spyOn(levelModel, 'findOneAndUpdate').mockReturnValue({
                exec: jest.fn(),
            } as never);
            gameSate.otherSocketId = undefined;
            await service.updateHighscore(endTime, gameSate);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith({ id: levelId }, { playerSolo: expectedSoloNames, timeSolo: expectedSoloTimes });
        });

        it('should correctly update multi', async () => {
            const levelId = 1;
            const expectedMultiNames = ['Bon Jovi', levelArray[0].playerMulti[0], levelArray[0].playerMulti[1]];
            const expectedMultiTimes = [endTime, levelArray[0].timeMulti[0], levelArray[0].timeMulti[1]];
            jest.spyOn(service, 'getPlayerMultiArray').mockResolvedValue(levelArray[0].playerMulti);
            jest.spyOn(service, 'getTimeMultiArray').mockResolvedValue(levelArray[0].timeMulti);
            const findOneAndUpdateSpy = jest.spyOn(levelModel, 'findOneAndUpdate').mockReturnValue({
                exec: jest.fn(),
            } as never);
            await service.updateHighscore(endTime, gameSate);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith({ id: levelId }, { playerMulti: expectedMultiNames, timeMulti: expectedMultiTimes });
        });
    });

    describe('getLevelsInPage', () => {
        it('should return null if page number is 0 or negative', async () => {
            let page = 0;
            let result = await service.getLevelsInPage(page);
            expect(result).toBeNull();
            page = TestConstants.INVALID_PAGE_NUMBER;
            result = await service.getLevelsInPage(page);
            expect(result).toBeNull();
        });

        it('should return the correct levels', async () => {
            const pageNumber = 1;
            jest.spyOn(levelModel, 'find').mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        exec: jest.fn().mockReturnValue(levelDocArray),
                    }),
                }),
            } as never);
            const result = await service.getLevelsInPage(pageNumber);
            expect(result).toEqual(levelArray);
        });
    });

    describe('getGameConstants', () => {
        it('should return game constants', async () => {
            jest.spyOn(gameConstantsModel, 'find').mockReturnValue({ exec: jest.fn().mockResolvedValue(gameConstantsDocArray) } as never);
            const result = await service.getGameConstants();
            expect(result).toEqual(gameConstantsArray[0]);
        });
    });

    describe('resetGameConstants', () => {
        it('should call setNewGameConstants with default constants', async () => {
            const spy = jest.spyOn(service, 'setNewGameConstants').mockImplementation(jest.fn());
            await service.resetGameConstants();
            expect(spy).toHaveBeenCalledWith({
                initialTime: Constants.INIT_COUNTDOWN_TIME,
                timePenaltyHint: Constants.HINT_PENALTY,
                timeGainedDifference: Constants.COUNTDOWN_TIME_WIN,
            });
        });
    });

    describe('setNewGameConstants', () => {
        it('should call findOneAndUpdate', async () => {
            const findOneAndUpdateSpy = jest.spyOn(gameConstantsModel, 'findOneAndUpdate').mockReturnValue({
                exec: jest.fn(),
            } as never);
            await service.setNewGameConstants(gameConstantsArray[0]);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleErrors()', () => {
        it('should return the correct error message', () => {
            const error = new Error('skill issue');
            const message = service['handleErrors'](error);
            expect(message.title).toEqual('error');
            expect(message.body).toEqual('Échec du téléchargement du jeu. Veuillez réessayer plus tard. \nErreur: ' + error.message);
        });
    });
});

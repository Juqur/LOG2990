import { Level, levelModel } from '@app/model/schema/level.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongodbService } from './mongodb.service';

describe('MongodbService', () => {
    let service: MongodbService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MongodbService,
                {
                    provide: getModelToken(Level.name),
                    useValue: levelModel,
                },
            ],
        }).compile();

        service = module.get<MongodbService>(MongodbService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('should return the solo highscores names of the specified level', async () => {
    //     const levelId = 1;
    //     const playerSolo = ['Bob', 'Charlie', 'Dave'];
    //     jest.spyOn(levelModel, 'findOne').mockReturnValue({ playerSolo }); // wtf do you mean its a mock of the return value,
    //     // why do you want a query?

    //     const result = await service.getPlayerSoloArray(levelId);

    //     expect(result).toEqual(playerSolo);
    //     expect(levelModel.findOne).toHaveBeenCalledWith({ id: levelId });
    // });

    describe('updateHighscore', () => {
        it('should update highscores when new score is better than previous scores', async () => {
            const gameState = {
                levelId: 1,
                foundDifferences: [],
                amountOfDifferencesFound: 7,
                playerName: 'Gerard',
                isInGame: true,
                isGameFound: false,
                otherSocketId: '',
                isInCheatMode: false,
            };

            const levelModel = {
                findOne: jest.fn(() => ({
                    id: gameState.levelId,
                    playerSolo: ['Bob', 'Charlie', 'Dave'],
                    timeSolo: [50, 80, 100],
                    playerMulti: [],
                    timeMulti: [],
                    save: jest.fn(),
                })),
            };

            await service.updateHighscore(90, gameState);

            expect(levelModel.findOne).toHaveBeenCalledWith({ id: gameState.levelId });
            expect(levelModel.findOne().save).toHaveBeenCalled();
            const savedLevel = levelModel.findOne().save.mock.calls[0][2];
            expect(savedLevel.playerSolo).toEqual(['Bob', 'Charlie', gameState.playerName]);
            expect(savedLevel.timeSolo).toEqual([50, 80, 90]);
        });

        it('should not update highscore when new score is worse than previous scores', async () => {
            const gameState = {
                levelId: 1,
                foundDifferences: [],
                amountOfDifferencesFound: 7,
                playerName: 'Gerard',
                isInGame: true,
                isGameFound: false,
                otherSocketId: '',
                isInCheatMode: false,
            };
            const levelModel = {
                findOne: jest.fn(() => ({
                    id: gameState.levelId,
                    playerSolo: ['Bob', 'Charlie', 'Dave'],
                    timeSolo: [50, 80, 100],
                    playerMulti: [],
                    timeMulti: [],
                    save: jest.fn(),
                })),
            };

            // this is very confusing
            const spyFindOne = jest.spyOn(levelModel, 'findOne').mockImplementation(() => levelModel);
            const spySave = jest.spyOn(service.levelModel, 'save').mockImplementation(() => levelModel);

            await service.updateHighscore(120, gameState);

            expect(spyFindOne).toHaveBeenCalledWith({ id: gameState.levelId });
            expect(spySave).not.toHaveBeenCalled();
        });
    });
});

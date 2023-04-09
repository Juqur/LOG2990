import { Test, TestingModule } from '@nestjs/testing';
import { MongodbService } from './mongodb.service';

describe('MongodbService', () => {
    let service: MongodbService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MongodbService],
        }).compile();

        service = module.get<MongodbService>(MongodbService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return playerSolo array for a level', async () => {
        const levelModelMock = {
            findOne: jest.fn().mockResolvedValue({
                playerSolo: ['Bob', 'Charlie', 'Dave'],
            }),
        };
        const mongodbService = new MongodbService(levelModelMock as unknown);

        const result = await mongodbService.getPlayerSoloArray(1);

        expect(levelModelMock.findOne).toHaveBeenCalledWith({ id: 1 });
        expect(result).toEqual(['Bob', 'Charlie', 'Dave']);
    });

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

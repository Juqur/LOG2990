import { Level, LevelDocument, levelSchema } from '@app/model/schema/level.schema';
import { Constants } from '@common/constants';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { MongodbService } from './mongodb.service';

const mockLevel = (
    id = 1,
    name = 'Juan Cena',
    playerSolo = ['Bob', 'Charlie', 'Dave'],
    timeSolo = Constants.defaultTimeSolo,
    playerMulti = ['The', 'Under', 'Taker'],
    timeMulti = Constants.defaultTimeMulti,
    isEasy = true,
    nbDifferences = Constants.MIN_DIFFERENCES_LIMIT,
    canJoin = true,
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

const mockLevelDoc = ({})

describe('MongodbService', () => {
    let service: MongodbService;
    let levelModel: Model<LevelDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Level.name, schema: levelSchema }]),
            ],
            providers: [MongodbService],
        }).compile();
        service = module.get<MongodbService>(MongodbService);
        levelModel = module.get<Model<LevelDocument>>(getModelToken(Level.name));
        connection = await module.get(getConnectionToken());

        await levelModel.deleteMany({});
    });

    afterEach(async () => {
        await connection.close();
        await mongoServer.stop();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the solo highscores names of the specified level', async () => {
        const levelId = 1;
        const playerSolo = { playerSolo: ['Bob', 'Charlie', 'Dave'] };
        jest.spyOn(levelModel, 'findOne').mockReturnValue(playerSolo); // wtf do you mean its a mock of the return value,
        // why do you want a query?

        const result = await service.getPlayerSoloArray(levelId);

        expect(result).toEqual(playerSolo);
        expect(levelModel.findOne).toHaveBeenCalledWith({ id: levelId });
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

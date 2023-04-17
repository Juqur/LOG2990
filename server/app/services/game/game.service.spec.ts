/* eslint-disable max-lines */
import { ImageService } from '@app/services/image/image.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Level } from 'assets/data/level';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { GameService, GameState } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let imageService: SinonStubbedInstance<ImageService>;

    beforeEach(async () => {
        imageService = createStubInstance(ImageService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [GameService, { provide: ImageService, useValue: imageService }],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getLevelDeletionQueue', () => {
        it('should return the correct data', () => {
            const expectedQueue = [1, 2, 3];
            service['levelDeletionQueue'] = expectedQueue;
            expect(service.getLevelDeletionQueue()).toEqual(expectedQueue);
        });
    });

    describe('getGameState', () => {
        it('should return the correct data', () => {
            const expectedGameState = {
                levelId: 0,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
                hintsUsed: 0,
            };
            service['playerGameMap'] = new Map<string, GameState>([['socket1', expectedGameState]]);
            service['playerGameMap'].set('socket', expectedGameState);
            expect(service.getGameState('socket')).toEqual(expectedGameState);
        });
    });

    describe('getPlayersWaitingForGame', () => {
        it('should select the correct players from a selected game', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                ['socket1', { levelId: 0, isInGame: false } as unknown as GameState],
                ['socket2', { levelId: 0, isInGame: true } as unknown as GameState],
                ['socket3', { levelId: 1, isInGame: false } as unknown as GameState],
                ['socket3', { levelId: 2, isInGame: false } as unknown as GameState],
            ]);
            const result = service.getPlayersWaitingForGame(0);
            expect(result).toStrictEqual(['socket1']);
            expect(service['playerGameMap']).not.toContain('socket2');
            expect(service['playerGameMap']).not.toContain('socket3');
            expect(service['playerGameMap']).not.toContain('socket4');
        });

        it('should return an empty array if there is no players from a selected game.', () => {
            const result = service.getPlayersWaitingForGame(0);
            expect(result).toEqual([]);
        });
    });

    describe('getJoinableLevels', () => {
        it('should select the correct players from a selected game', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                ['socket1', { levelId: 0, isGameFound: false } as unknown as GameState],
                ['socket2', { levelId: 0, isGameFound: true } as unknown as GameState],
                ['socket3', { levelId: 1, isGameFound: false } as unknown as GameState],
                ['socket4', { levelId: 2, isGameFound: true } as unknown as GameState],
            ]);
            const result = service.getJoinableLevels();
            expect(result).toStrictEqual([0, 1]);
        });

        it('should return an empty array if there is no players from a selected game.', () => {
            const result = service.getPlayersWaitingForGame(0);
            expect(result).toStrictEqual([]);
        });
    });
    describe('setLevelId', () => {
        it('should set the levelId', () => {
            const gameState: GameState = { levelId: 0 } as GameState;
            service['playerGameMap'].set('1', gameState);
            service.setLevelId('1', 1);
            expect(service['playerGameMap'].get('1').levelId).toEqual(1);
        });
    });
    describe('getImageInfoOnClick', () => {
        it('should remove all found differences if the game mode is timed', async () => {
            const gameState: GameState = {
                levelId: 1,
                foundDifferences: 1,
                amountOfDifferencesFound: 1,
                timedLevelList: [1],
            } as unknown as GameState;
            service['playerGameMap'].set('1', gameState);
            jest.spyOn(imageService, 'findDifference').mockReturnValue(Promise.resolve({ differencePixels: [1], totalDifferences: 1 }));
            await service.getImageInfoOnClick('1', 1);
            expect(service['playerGameMap'].get('1').foundDifferences).toEqual([]);
        });
        it('should return the correct data', async () => {
            service['playerGameMap'] = new Map<string, GameState>([
                [
                    'socket',
                    { levelId: 0, foundDifferences: [0], amountOfDifferencesFound: 0, playerName: 'player', isInGame: false } as unknown as GameState,
                ],
            ]);
            imageService.findDifference.resolves({ differencePixels: [1], totalDifferences: 7 });
            const result = await service.getImageInfoOnClick('socket', 1);
            expect(result).toEqual({ differencePixels: [1], totalDifferences: 7, amountOfDifferencesFound: 1 });
        });

        it('should share found differences with other player', async () => {
            service['playerGameMap'] = new Map<string, GameState>([
                [
                    'socket',
                    {
                        levelId: 0,
                        foundDifferences: [0, 1, 2],
                        amountOfDifferencesFound: 3,
                        playerName: 'player',
                        isInGame: false,
                        otherSocketId: 'socket2',
                        hintsUsed: 0,
                    } as unknown as GameState,
                ],
                [
                    'socket2',
                    { levelId: 0, foundDifferences: [0], amountOfDifferencesFound: 0, playerName: 'player', isInGame: false } as unknown as GameState,
                ],
            ]);
            imageService.findDifference.resolves({ differencePixels: [1], totalDifferences: 7 });
            await service.getImageInfoOnClick('socket', 1);
            expect(service['playerGameMap'].get('socket2').foundDifferences).toEqual([0, 1, 2]);
        });
    });

    describe('verifyWinCondition', () => {
        const mockedSocket = { id: 'socket1', join: jest.fn() } as unknown as Socket;
        const mockedServer = { sockets: { sockets: { get: jest.fn() } } } as unknown as Server;
        let spyDeleteUser: jest.SpyInstance;
        let spyRemoveLevel: jest.SpyInstance;

        beforeEach(() => {
            spyDeleteUser = jest.spyOn(service, 'deleteUserFromGame').mockImplementation();
            spyRemoveLevel = jest.spyOn(service, 'removeLevel').mockImplementation();
        });

        it('should call deleteUserFromGame twice if the user wins in multiplayer', () => {
            service['playerGameMap'].set('socket1', {
                foundDifferences: [0, 1, 2],
                amountOfDifferencesFound: 3,
                otherSocketId: 'socket2',
            } as unknown as GameState);
            service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(spyDeleteUser).toHaveBeenCalledTimes(2);
        });

        it('should call removeLevelFromDeletionQueue once if the user wins in multiplayer', () => {
            service['playerGameMap'].set('socket1', {
                foundDifferences: [0, 1, 2],
                amountOfDifferencesFound: 3,
                otherSocketId: 'socket2',
            } as unknown as GameState);
            service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(spyRemoveLevel).toHaveBeenCalledTimes(1);
        });

        it('should return true if the user wins in multiplayer', () => {
            service['playerGameMap'].set('socket1', {
                foundDifferences: [0, 1, 2],
                amountOfDifferencesFound: 3,
                otherSocketId: 'socket2',
            } as unknown as GameState);
            const result = service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(result).toBeTruthy();
        });

        it('should call deleteUserFromGame once if the user wins in single player', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2], amountOfDifferencesFound: 3 } as unknown as GameState);
            service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(spyDeleteUser).toHaveBeenCalledTimes(1);
        });

        it('should call removeLevelFromDeletionQueue once if the user wins in single player', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2], amountOfDifferencesFound: 3 } as unknown as GameState);
            service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(spyRemoveLevel).toHaveBeenCalledTimes(1);
        });

        it('should return true if the user wins in single player', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2], amountOfDifferencesFound: 3 } as unknown as GameState);
            const result = service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(result).toBeTruthy();
        });

        it('should return false if the win condition is not met', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2], amountOfDifferencesFound: 3 } as unknown as GameState);
            const result = service.verifyWinCondition(mockedSocket, mockedServer, 1);
            expect(result).toBe(false);
        });
    });

    describe('createGameState', () => {
        it('should return the correct data for single player', () => {
            service.createGameState('socket', { levelId: 1, playerName: 'player' }, false);
            expect(service['playerGameMap'].get('socket')).toStrictEqual({
                levelId: 1,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player',
                isInGame: true,
                isGameFound: true,
                isInCheatMode: false,
                hintsUsed: 0,
            });
        });

        it('should return the correct data for multiplayer', () => {
            service.createGameState('socket', { levelId: 1, playerName: 'player' }, true);
            expect(service['playerGameMap'].get('socket')).toStrictEqual({
                levelId: 1,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
                hintsUsed: 0,
            });
        });

        it('should create a list of timed levels if default it is equal to 0', async () => {
            const level = {} as Level;
            jest.spyOn(imageService, 'getLevels').mockReturnValue(Promise.resolve([level]));
            await service.createGameState('1', { levelId: 0, playerName: '' }, false);
            expect(service['playerGameMap'].get('1').timedLevelList.length).toEqual(1);
        });
    });

    describe('findAvailableGame', () => {
        it('should return undefined if there is not available games', () => {
            const result = service.findAvailableGame('undefined', NaN);
            expect(result).toBeUndefined();
        });

        it('should return the correct other socket id to match', () => {
            const expectedGameState = { levelId: 0, isGameFound: false, otherSocketId: 'socket2' } as unknown as GameState;
            service['playerGameMap'].set('socket2', expectedGameState);
            const result = service.findAvailableGame('socket1', 0);
            expect(result).toStrictEqual('socket2');
        });
    });

    describe('connectRooms', () => {
        const mockedGameState = { otherSocketId: 'socket2', isInGame: false } as unknown as GameState;
        const mockedOtherGameState = { otherSocketId: 'socket1', isInGame: false } as unknown as GameState;

        const mockedSocket = { id: 'socket1', join: jest.fn() } as unknown as Socket;
        const mockedOtherSocket = { id: 'socket2', join: jest.fn() } as unknown as Socket;
        let bindPlayersSpy: jest.SpyInstance;

        beforeEach(() => {
            bindPlayersSpy = jest.spyOn(service, 'bindPlayers').mockImplementation();
            service['playerGameMap'].set('socket1', mockedGameState);
            service['playerGameMap'].set('socket2', mockedOtherGameState);
        });

        it('should set isInGame to true for both new sockets', () => {
            service.connectRooms(mockedSocket, mockedOtherSocket);
            expect(service['playerGameMap'].get('socket1').isInGame).toBeTruthy();
            expect(service['playerGameMap'].get('socket2').isInGame).toBeTruthy();
        });

        it('should call bindPlayers', () => {
            service.connectRooms(mockedSocket, mockedOtherSocket);
            expect(bindPlayersSpy).toHaveBeenCalledWith(mockedSocket.id, mockedOtherSocket.id);
        });
    });

    describe('deleteUserFromGame', () => {
        const mockedSocket = { id: 'socket1', leave: jest.fn() } as unknown as Socket;
        let leaveSpy: jest.SpyInstance;
        let deleteSpy: jest.SpyInstance;

        beforeEach(() => {
            leaveSpy = jest.spyOn(mockedSocket, 'leave').mockImplementation();
            deleteSpy = jest.spyOn(Map.prototype, 'delete');
        });

        it('should not call delete if the user is not in a game', () => {
            service.deleteUserFromGame(mockedSocket);
            expect(deleteSpy).not.toHaveBeenCalled();
        });

        it('should not call leave if the user is not in a game', () => {
            service.deleteUserFromGame(mockedSocket);
            expect(leaveSpy).not.toHaveBeenCalled();
        });

        it('should call leave if there is another player', () => {
            const mockedGameState = { levelId: 0, otherSocketId: 'socket2' } as unknown as GameState;
            service['playerGameMap'].set('socket1', mockedGameState);

            service.deleteUserFromGame(mockedSocket);
            expect(leaveSpy).toHaveBeenCalledWith('socket2');
        });

        it('should delete the socket from the player game map', () => {
            const mockedGameState = { otherSocketId: 'otherSocket' } as unknown as GameState;
            service['playerGameMap'].set('socket1', mockedGameState);

            service.deleteUserFromGame(mockedSocket);
            expect(deleteSpy).toHaveBeenCalledWith('socket1');
            expect(service['playerGameMap'].get('socket1')).toBeUndefined();
        });
    });

    describe('isLevelBeingPlayed', () => {
        it('should return true if the level is being played', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                [
                    'socket1',
                    {
                        levelId: 0,
                        foundDifferences: [],
                        amountOfDifferencesFound: 0,
                        playerName: 'player1',
                        isInGame: true,
                        isGameFound: true,
                        isInCheatMode: false,
                        hintsUsed: 0,
                    },
                ],
            ]);
            const result = service['isLevelBeingPlayed'](0);
            expect(result).toBeTruthy();
        });

        it('should return false if the level is not being played', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                [
                    'socket1',
                    {
                        levelId: 0,
                        foundDifferences: [],
                        amountOfDifferencesFound: 0,
                        playerName: 'player1',
                        isInGame: false,
                        isGameFound: true,
                        isInCheatMode: false,
                        hintsUsed: 0,
                    },
                ],
            ]);
            const result = service['isLevelBeingPlayed'](0);
            expect(result).toBeFalsy();
        });
    });
    describe('addLevelToDeletionQueue', () => {
        it('should add the level to the deletion queue', () => {
            service['levelDeletionQueue'] = [1];
            service.addLevelToDeletionQueue(2);
            expect(service['levelDeletionQueue']).toEqual([1, 2]);
        });
    });

    describe('addLevelToTimedGame', () => {
        it('should add the level to timed level list for all gameStates', () => {
            const level: Level = {} as Level;
            const gameState: GameState = { timedLevelList: [level] } as GameState;
            service['playerGameMap'].set('1', gameState);
            service.addLevelToTimedGame(level);
            expect(service['playerGameMap'].get('1').timedLevelList.length).toEqual(2);
        });
    });

    describe('removeLevel', () => {
        let addLevelSpy: jest.SpyInstance;
        let deleteLevelSpy: jest.SpyInstance;

        beforeEach(() => {
            addLevelSpy = jest.spyOn(service, 'addLevelToDeletionQueue').mockImplementation();
            deleteLevelSpy = jest.spyOn(imageService, 'deleteLevelData').mockImplementation();
        });

        it('should add the level to deletion queue if the level is being played', () => {
            jest.spyOn(service, 'isLevelBeingPlayed' as never).mockReturnValue(true as never);
            service.removeLevel(1, true);
            expect(addLevelSpy).toBeCalledWith(1);
        });

        it('should call deleteLevelData if the level is not being played', () => {
            jest.spyOn(service, 'isLevelBeingPlayed' as never).mockReturnValue(false as never);
            service.removeLevel(1, true);
            expect(deleteLevelSpy).toBeCalledWith(1);
        });

        it('should remove the level from deletion queue if the level is to be deleted', () => {
            jest.spyOn(service, 'isLevelBeingPlayed' as never).mockReturnValue(false as never);
            service['levelDeletionQueue'] = [1, 2];
            service.removeLevel(1, false);
            expect(service['levelDeletionQueue']).toEqual([2]);
        });

        it('should delete the level', () => {
            jest.spyOn(service, 'isLevelBeingPlayed' as never).mockReturnValue(false as never);
            service['levelDeletionQueue'] = [1, 2];
            service.removeLevel(1, false);
            expect(deleteLevelSpy).toBeCalledWith(1);
        });
    });

    describe('bindPlayers', () => {
        it('should update both sockets correctly', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                [
                    'socket1',
                    {
                        levelId: 0,
                        foundDifferences: [],
                        amountOfDifferencesFound: 0,
                        playerName: 'player1',
                        isInGame: false,
                        isGameFound: false,
                        isInCheatMode: false,
                        hintsUsed: 0,
                    },
                ],
                [
                    'socket2',
                    {
                        levelId: 0,
                        foundDifferences: [],
                        amountOfDifferencesFound: 0,
                        playerName: 'player2',
                        isInGame: false,
                        isGameFound: false,
                        isInCheatMode: false,
                        hintsUsed: 0,
                    },
                ],
            ]);
            service.bindPlayers('socket1', 'socket2');
            expect(service['playerGameMap'].get('socket1').isGameFound).toBeTruthy();
            expect(service['playerGameMap'].get('socket1').otherSocketId).toBe('socket2');
            expect(service['playerGameMap'].get('socket2').isGameFound).toBeTruthy();
            expect(service['playerGameMap'].get('socket2').otherSocketId).toBe('socket1');
        });
    });

    describe('startCheatMode', () => {
        it('should return all the differences as a single array', async () => {
            jest.spyOn(service, 'getGameState').mockReturnValue({
                levelId: 0,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
                hintsUsed: 0,
            });
            const spy = jest.spyOn(service['imageService'], 'getAllDifferences');
            spy.mockReturnValue(Promise.resolve([[1], [2], [3]]));
            const result = await service.startCheatMode('socket1');
            expect(spy).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual([1, 2, 3]);
        });
    });

    describe('stopCheatMode', () => {
        it('should set isInCheatMode to false', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                [
                    'socket1',
                    {
                        levelId: 0,
                        foundDifferences: [],
                        amountOfDifferencesFound: 0,
                        playerName: 'player1',
                        isInGame: false,
                        isGameFound: false,
                        isInCheatMode: true,
                        hintsUsed: 0,
                    },
                ],
            ]);
            jest.spyOn(service, 'getGameState').mockReturnValue({
                levelId: 0,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: true,
                hintsUsed: 0,
            });
            service.stopCheatMode('socket1');
            expect(service['playerGameMap'].get('socket1').isInCheatMode).toEqual(false);
        });
    });

    describe('askHint', () => {
        it('should call the image service, and return a array of size 1 on the first hint', async () => {
            jest.spyOn(service, 'getGameState').mockReturnValue({
                levelId: 0,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
                hintsUsed: 0,
            });
            const differencesSpy = jest.spyOn(service['imageService'], 'getAllDifferences');
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            differencesSpy.mockImplementation().mockReturnValue(Promise.resolve([[4]]));
            const result = await service.askHint('socket1');
            expect(differencesSpy).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
        });

        it('should call the image service, and return a array of size 2 on the second hint', async () => {
            jest.spyOn(service, 'getGameState').mockReturnValue({
                levelId: 0,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
                hintsUsed: 1,
            });
            const differencesSpy = jest.spyOn(service['imageService'], 'getAllDifferences');
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            differencesSpy.mockImplementation().mockReturnValue(Promise.resolve([[1000000]]));
            const result = await service.askHint('socket1');
            expect(differencesSpy).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
        });

        it('should return the correct subquadrants', async () => {
            jest.spyOn(service, 'getGameState').mockReturnValue({
                levelId: 0,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
                hintsUsed: 1,
            });
            const differencesSpy = jest.spyOn(service['imageService'], 'getAllDifferences');
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            differencesSpy.mockImplementation().mockReturnValue(Promise.resolve([[3500]]));
            const result = await service.askHint('socket1');
            expect(result).toEqual([1, 2]);
        });

        it('should return undefined if all hints have been used', () => {
            jest.spyOn(service, 'getGameState').mockReturnValue({
                levelId: 0,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
                hintsUsed: 3,
            });
            const differencesSpy = jest.spyOn(service['imageService'], 'getAllDifferences');
            differencesSpy.mockImplementation().mockReturnValue(Promise.resolve([[1]]));
            const result = service.askHint('socket1') as Promise<number[]>;
            expect(result).resolves.toEqual(undefined);
        });

        it('should call askShape on the third hint request', async () => {
            jest.spyOn(service, 'getGameState').mockReturnValue({
                levelId: 0,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
                hintsUsed: 2,
            });
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const askShapeSpy = jest.spyOn(service, 'askShape').mockImplementation().mockReturnValue([7]);
            // const spy = sinon.spy(service, 'askShape');
            const differencesSpy = jest.spyOn(service['imageService'], 'getAllDifferences');
            differencesSpy.mockImplementation().mockReturnValue(Promise.resolve([[2]]));
            const result = await service.askHint('socket1');
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(result).toEqual([7]);
            expect(askShapeSpy).toHaveBeenCalled();
        });
    });

    describe('askShape', () => {
        it('should return an array of a size two numbers greater', () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const mockedDifference = [1, 2, 3, 4, 5, 6, 7, 11, 1200000, 8, 9, 10];
            const result = service.askShape(mockedDifference);
            expect(result).toHaveLength(mockedDifference.length + 2);
        });
    });

    describe('deleteLevel', () => {
        it('should call deleteLevelData', () => {
            const deleteLevelDataSpy = jest.spyOn(imageService, 'deleteLevelData' as never);
            service.deleteLevel(0);
            expect(deleteLevelDataSpy).toHaveBeenCalled();
        });
    });

    describe('setIsGameFound', () => {
        it('should set isGameFound to true', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                [
                    'socket1',
                    {
                        levelId: 0,
                        foundDifferences: [],
                        amountOfDifferencesFound: 0,
                        playerName: 'player1',
                        isInGame: false,
                        isGameFound: false,
                        isInCheatMode: false,
                        hintsUsed: 0,
                    },
                ],
            ]);
            service.setIsGameFound('socket1', true);
            expect(service['playerGameMap'].get('socket1').isGameFound).toBeTruthy();
        });
    });

    describe('removeLevelFromTimedList', () => {
        it('should remove the level from the timed mode level list', () => {
            const levelId = 1;
            const gameState: GameState = { timedLevelList: [{ id: 1 } as Level] } as GameState;
            service['removeLevelFromTimedList'](gameState, levelId);
            expect(gameState.timedLevelList).toEqual([]);
        });
    });

    describe('getRandomLevelForTimedGame', () => {
        it('should return a random level', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0);
            const level: Level = { id: 1 } as Level;
            const gameState: GameState = { timedLevelList: [level, { id: 2 } as Level] } as GameState;
            service['playerGameMap'].set('1', gameState);
            expect(service.getRandomLevelForTimedGame('1')).toEqual(level);
        });
    });
});

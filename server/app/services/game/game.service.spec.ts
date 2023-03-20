/* eslint-disable max-lines */
import { ImageService } from '@app/services/image/image.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
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
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
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

    describe('getImageInfoOnClick', () => {
        it('should return the correct data', async () => {
            service['playerGameMap'] = new Map<string, GameState>([
                ['socket', { levelId: 0, foundDifferences: [0], playerName: 'player', isInGame: false } as unknown as GameState],
            ]);
            imageService.findDifference.resolves({ differencePixels: [1], totalDifferences: 7 });
            const result = await service.getImageInfoOnClick('socket', 1);
            expect(result).toEqual({ differencePixels: [1], totalDifferences: 7, amountOfDifferencesFound: 1 });
        });
    });

    describe('verifyWinCondition', () => {
        const mockedSocket = { id: 'socket1', join: jest.fn() } as unknown as Socket;
        const mockedServer = { sockets: { sockets: { get: jest.fn() } } } as unknown as Server;
        let spyDeleteUser: jest.SpyInstance;
        let spyRemoveLevel: jest.SpyInstance;

        beforeEach(() => {
            spyDeleteUser = jest.spyOn(service, 'deleteUserFromGame').mockImplementation();
            spyRemoveLevel = jest.spyOn(service, 'removeLevelFromDeletionQueue').mockImplementation();
        });

        it('should call deleteUserFromGame twice if the user wins in multiplayer', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2], otherSocketId: 'socket2' } as unknown as GameState);
            service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(spyDeleteUser).toHaveBeenCalledTimes(2);
        });

        it('should call removeLevelFromDeletionQueue once if the user wins in multiplayer', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2], otherSocketId: 'socket2' } as unknown as GameState);
            service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(spyRemoveLevel).toHaveBeenCalledTimes(1);
        });

        it('should return true if the user wins in multiplayer', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2], otherSocketId: 'socket2' } as unknown as GameState);
            const result = service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(result).toBeTruthy();
        });

        it('should call deleteUserFromGame once if the user wins in single player', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2] } as unknown as GameState);
            service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(spyDeleteUser).toHaveBeenCalledTimes(1);
        });

        it('should call removeLevelFromDeletionQueue once if the user wins in single player', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2] } as unknown as GameState);
            service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(spyRemoveLevel).toHaveBeenCalledTimes(1);
        });

        it('should return true if the user wins in single player', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2] } as unknown as GameState);
            const result = service.verifyWinCondition(mockedSocket, mockedServer, 3);
            expect(result).toBeTruthy();
        });

        it('should return false if the win condition is not met', () => {
            service['playerGameMap'].set('socket1', { foundDifferences: [0, 1, 2] } as unknown as GameState);
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
                playerName: 'player',
                isInGame: true,
                isGameFound: true,
                isInCheatMode: false,
            });
        });

        it('should return the correct data for multiplayer', () => {
            service.createGameState('socket', { levelId: 1, playerName: 'player' }, true);
            expect(service['playerGameMap'].get('socket')).toStrictEqual({
                levelId: 1,
                foundDifferences: [],
                playerName: 'player',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
            });
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

    describe('verifyIfLevelIsBeingPlayed', () => {
        it('should return true if the level is being played', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                ['socket1', { levelId: 0, foundDifferences: [], playerName: 'player1', isInGame: true, isGameFound: true, isInCheatMode: false }],
            ]);
            const result = service.verifyIfLevelIsBeingPlayed(0);
            expect(result).toBeTruthy();
        });

        it('should return false if the level is not being played', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                ['socket1', { levelId: 0, foundDifferences: [], playerName: 'player1', isInGame: false, isGameFound: true, isInCheatMode: false }],
            ]);
            const result = service.verifyIfLevelIsBeingPlayed(0);
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

    describe('removeLevelFromDeletionQueue', () => {
        it('should call deleteLevelData', () => {
            const deleteLevelDataSpy = jest.spyOn(imageService, 'deleteLevelData' as never);
            service['levelDeletionQueue'] = [1];
            service.removeLevelFromDeletionQueue(1);
            expect(deleteLevelDataSpy).toHaveBeenCalled();
        });

        it('should not call deleteLevelData if the level is undefined', () => {
            const deleteLevelDataSpy = jest.spyOn(imageService, 'deleteLevelData' as never);
            service['levelDeletionQueue'] = [];
            service.removeLevelFromDeletionQueue(1);
            expect(deleteLevelDataSpy).not.toHaveBeenCalled();
        });

        it('should remove the level from the deletion queue', () => {
            service['levelDeletionQueue'] = [1, 2, 3];
            service.removeLevelFromDeletionQueue(2);
            expect(service['levelDeletionQueue']).toEqual([1, 3]);
        });
    });

    describe('bindPlayers', () => {
        it('should update both sockets correctly', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                ['socket1', { levelId: 0, foundDifferences: [], playerName: 'player1', isInGame: false, isGameFound: false, isInCheatMode: false }],
                ['socket2', { levelId: 0, foundDifferences: [], playerName: 'player2', isInGame: false, isGameFound: false, isInCheatMode: false }],
            ]);
            service.bindPlayers('socket1', 'socket2');
            expect(service['playerGameMap'].get('socket1').isGameFound).toBeTruthy();
            expect(service['playerGameMap'].get('socket1').otherSocketId).toBe('socket2');
            expect(service['playerGameMap'].get('socket2').isGameFound).toBeTruthy();
            expect(service['playerGameMap'].get('socket2').otherSocketId).toBe('socket1');
        });
    });

    describe('startCheatMode', () => {
        it('should return all the differences as a single array', () => {
            jest.spyOn(service, 'getGameState').mockReturnValue({
                levelId: 0,
                foundDifferences: [],
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: false,
            });
            const spy = jest.spyOn(service['imageService'], 'getAllDifferences');
            spy.mockImplementation().mockReturnValue(Promise.resolve([[1], [2], [3]]));
            const result = service.startCheatMode('socket1');
            expect(spy).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual(Promise.resolve([1, 2, 3]));
        });
    });

    describe('stopCheatMode', () => {
        it('should set isInCheatMode to false', () => {
            service['playerGameMap'] = new Map<string, GameState>([
                ['socket1', { levelId: 0, foundDifferences: [], playerName: 'player1', isInGame: false, isGameFound: false, isInCheatMode: true }],
            ]);
            jest.spyOn(service, 'getGameState').mockReturnValue({
                levelId: 0,
                foundDifferences: [],
                playerName: 'player1',
                isInGame: false,
                isGameFound: false,
                isInCheatMode: true,
            });
            service.stopCheatMode('socket1');
            expect(service['playerGameMap'].get('socket1').isInCheatMode).toEqual(false);
        });
    });

    describe('deleteLevel', () => {
        it('should call deleteLevelData', () => {
            const deleteLevelDataSpy = jest.spyOn(imageService, 'deleteLevelData' as never);
            service.deleteLevel(0);
            expect(deleteLevelDataSpy).toHaveBeenCalled();
        });
    });
});

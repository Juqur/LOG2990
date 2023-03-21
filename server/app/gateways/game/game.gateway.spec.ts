import { ChatService } from '@app/services/chat/chat.service';
import { GameService, GameState } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameData } from '@common/game-data';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Namespace, Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let socket: SinonStubbedInstance<Socket>;
    let socketSecondPlayer: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameService: SinonStubbedInstance<GameService>;
    let timerService: SinonStubbedInstance<TimerService>;
    let gameState: GameState;

    const gameData: GameData = {
        differencePixels: [],
        totalDifferences: 0,
        amountOfDifferencesFound: 0,
    };

    beforeEach(async () => {
        gameState = {
            levelId: 1,
            foundDifferences: [],
            playerName: 'Alice',
            isInGame: false,
            isGameFound: false,
        };
        timerService = createStubInstance<TimerService>(TimerService);
        gameService = createStubInstance<GameService>(GameService);
        socket = createStubInstance<Socket>(Socket);
        socketSecondPlayer = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                ImageService,
                ChatService,
                { provide: GameService, useValue: gameService },
                { provide: TimerService, useValue: timerService },
                { provide: Socket, useValue: socket },
                { provide: Socket, useValue: socketSecondPlayer },
                { provide: Server, useValue: server },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        const socketNameSpace = {} as Namespace;
        const socketMaps = new Map<string, Socket>();
        Object.defineProperty(server, 'sockets', { value: socketNameSpace });
        Object.defineProperty(socketNameSpace, 'sockets', { value: socketMaps });
        server.sockets.sockets.get = jest.fn().mockReturnValue(socketSecondPlayer);
        gateway['server'] = server;

        jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('onJoinSoloClassicGame', () => {
        it('should call timer service and game service when player joins a solo game', () => {
            const timerSpy = jest.spyOn(timerService, 'startTimer');
            const gameSpy = jest.spyOn(gameService, 'createGameState');
            const data = { levelId: 1, playerName: 'test' };
            gateway.onJoinSoloClassicGame(socket, data);
            expect(gameSpy).toHaveBeenCalled();
            expect(timerSpy).toHaveBeenCalled();
        });
    });

    describe('onClick', () => {
        it('should emit back to socket when player clicks', async () => {
            jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
            jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(false);
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            const emitSpy = jest.spyOn(socket, 'emit');
            await gateway.onClick(socket, 1);
            expect(emitSpy).toBeCalledWith('processedClick', gameData);
        });

        it('should emit to the opponent when player clicks', async () => {
            gameState.otherSocketId = '1';
            jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
            jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(false);
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            const emitSpy = jest.spyOn(socket, 'emit');
            const emitSecondPlayerSpy = jest.spyOn(socketSecondPlayer, 'emit');
            await gateway.onClick(socket, 1);
            expect(emitSpy).toBeCalledWith('processedClick', gameData);
            expect(emitSecondPlayerSpy).toBeCalledWith('processedClick', gameData);
        });

        it('should emit a victory event if player wins', async () => {
            jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
            jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(true);
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);

            const timerSpy = jest.spyOn(timerService, 'stopTimer');
            const gameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            const emitSpy = jest.spyOn(socket, 'emit');

            await gateway.onClick(socket, 1);

            expect(emitSpy).toBeCalledWith('processedClick', gameData);
            expect(emitSpy).toBeCalledWith('victory');
            expect(timerSpy).toBeCalled();
            expect(gameSpy).toBeCalled();
        });

        it('should emit a defeat to the opponent event if player wins', async () => {
            gameState.otherSocketId = '1';
            jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
            jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(true);
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            jest.spyOn(timerService, 'stopTimer');
            jest.spyOn(gameService, 'deleteUserFromGame');
            const emitSecondPlayerSpy = jest.spyOn(socketSecondPlayer, 'emit');

            await gateway.onClick(socket, 1);

            expect(emitSecondPlayerSpy).toBeCalledWith('processedClick', gameData);
            expect(emitSecondPlayerSpy).toBeCalledWith('defeat');
        });
    });

    describe('onGameSelection', () => {
        it('should emit back to the player if the name is invalid', () => {
            const emitSpy = jest.spyOn(socket, 'emit');
            gateway.onGameSelection(socket, { playerName: '', levelId: 1 });
            expect(emitSpy).toBeCalledWith('invalidName');
        });

        it('should emit back to the player if he finds a match', () => {
            jest.spyOn(gameService, 'findAvailableGame').mockReturnValue('1');
            const emitSpy = jest.spyOn(socket, 'emit');
            gateway.onGameSelection(socket, { playerName: 'Alice', levelId: 1 });
            expect(emitSpy).toBeCalledWith('toBeAccepted');
        });

        it('should emit to the opponent if the player finds a match', () => {
            const name = 'Alice';
            jest.spyOn(gameService, 'findAvailableGame').mockReturnValue('1');
            const emitSpy = jest.spyOn(socketSecondPlayer, 'emit');
            gateway.onGameSelection(socket, { playerName: name, levelId: 1 });
            expect(emitSpy).toBeCalledWith('playerSelection', name);
        });

        it('should create a new game if player does not find a match', () => {
            const levelId = 1;
            const name = 'Alice';
            jest.spyOn(gameService, 'findAvailableGame').mockReturnValue(undefined);
            const createNewGameSpy = jest.spyOn(gameService, 'createGameState');
            gateway.onGameSelection(socket, { playerName: name, levelId });
            expect(createNewGameSpy).toBeCalledWith(socket.id, { levelId, playerName: name }, true);
        });

        it('should update the selection page if player does not find a match', () => {
            const levelId = 1;
            jest.spyOn(gameService, 'findAvailableGame').mockReturnValue(undefined);
            const emitSpy = jest.spyOn(server, 'emit');
            gateway.onGameSelection(socket, { playerName: 'Alice', levelId });
            expect(emitSpy).toBeCalledWith('updateSelection', { levelId, canJoin: true });
        });
    });

    describe('onGameAccepted', () => {
        it('should connect both players into each other rooms', () => {
            const connectRoomSpy = jest.spyOn(gameService, 'connectRooms');
            gateway.onGameAccepted(socket);
            expect(connectRoomSpy).toBeCalledWith(socket, socketSecondPlayer);
        });

        it('should emit to the player that the game has started', () => {
            const secondGameState: GameState = {
                levelId: 1,
                foundDifferences: [],
                playerName: 'Bob',
                isGameFound: true,
                isInGame: true,
            };
            jest.spyOn(gameService, 'getGameState').mockReturnValueOnce(gameState).mockReturnValueOnce(secondGameState);
            const emitSpy = jest.spyOn(socket, 'emit');
            gateway.onGameAccepted(socket);
            expect(emitSpy).toBeCalledWith('startClassicMultiplayerGame', {
                levelId: gameState.levelId,
                playerName: gameState.playerName,
                secondPlayerName: secondGameState.playerName,
            });
        });

        it('should emit to the opponent that the game has started', () => {
            const secondGameState: GameState = {
                levelId: 1,
                foundDifferences: [],
                playerName: 'Bob',
                isGameFound: true,
                isInGame: true,
            };
            jest.spyOn(gameService, 'getGameState').mockReturnValueOnce(gameState).mockReturnValueOnce(secondGameState);
            const emitSpy = jest.spyOn(socketSecondPlayer, 'emit');
            gateway.onGameAccepted(socket);
            expect(emitSpy).toBeCalledWith('startClassicMultiplayerGame', {
                levelId: gameState.levelId,
                playerName: secondGameState.playerName,
                secondPlayerName: gameState.playerName,
            });
        });

        it('should start the timer', () => {
            const startTimerSpy = jest.spyOn(timerService, 'startTimer');
            gateway.onGameAccepted(socket);
            expect(startTimerSpy).toBeCalledWith(socket.id, server, true, socketSecondPlayer.id);
        });

        it('should update the selection page', () => {
            const emitSpy = jest.spyOn(server, 'emit');
            gateway.onGameAccepted(socket);
            expect(emitSpy).toBeCalledWith('updateSelection', { levelId: gameState.levelId, canJoin: false });
        });
    });

    describe('onCancelledWhileWaiting', () => {
        it('should update the selection page', () => {
            const emitSpy = jest.spyOn(server, 'emit');
            gateway.onCancelledWhileWaiting(socket);
            expect(emitSpy).toBeCalledWith('updateSelection', { levelId: gameState.levelId, canJoin: false });
        });

        it('should delete the user from the game map', () => {
            const deleteUserFromGameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            gateway.onCancelledWhileWaiting(socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(socket);
        });
    });

    describe('onGameRejected', () => {
        it('should update the selection page', () => {
            const emitSpy = jest.spyOn(server, 'emit');
            gateway.onGameRejected(socket);
            expect(emitSpy).toBeCalledWith('updateSelection', { levelId: gameState.levelId, canJoin: false });
        });

        it('should delete the user and the opponent from the game map', () => {
            const deleteUserFromGameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            gateway.onGameRejected(socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(socketSecondPlayer);
        });

        it('should emit to the opponent that the game has been rejected', () => {
            const emitSpy = jest.spyOn(socketSecondPlayer, 'emit');
            gateway.onGameRejected(socket);
            expect(emitSpy).toBeCalledWith('rejectedGame');
        });
    });

    describe('onDeleteLevel', () => {
        it('should emit to everyone waiting for a game that the level has been deleted', () => {
            jest.spyOn(gameService, 'getPlayersWaitingForGame').mockReturnValue(['0', '1']);
            jest.spyOn(server.sockets.sockets, 'get').mockReturnValueOnce(socket).mockReturnValueOnce(socketSecondPlayer);
            const firstSocketSpy = jest.spyOn(socket, 'emit');
            const secondSocketSpy = jest.spyOn(socketSecondPlayer, 'emit');
            gateway.onDeleteLevel(socket, 1);
            expect(firstSocketSpy).toBeCalledWith('shutDownGame');
            expect(secondSocketSpy).toBeCalledWith('shutDownGame');
        });

        it('should emit to everyone that the level has been deleted', () => {
            jest.spyOn(gameService, 'getPlayersWaitingForGame').mockReturnValue([]);
            const emitSpy = jest.spyOn(server, 'emit');
            gateway.onDeleteLevel(socket, 1);
            expect(emitSpy).toBeCalledWith('deleteLevel', 1);
        });

        it('should add level to deletion queue if player are in the level', () => {
            const levelId = 1;
            jest.spyOn(gameService, 'getPlayersWaitingForGame').mockReturnValue([]);
            jest.spyOn(gameService, 'verifyIfLevelIsBeingPlayed').mockReturnValue(true);
            const addLevelToDeletionQueueSpy = jest.spyOn(gameService, 'addLevelToDeletionQueue');
            gateway.onDeleteLevel(socket, levelId);
            expect(addLevelToDeletionQueueSpy).toBeCalledWith(levelId);
        });
    });

    describe('onAbandonGame', () => {
        it('should call handlePlayerLeavingGame', () => {
            const handlePlayerLeavingGameSpy = jest.spyOn(gateway, 'handlePlayerLeavingGame' as never);
            gateway.onAbandonGame(socket);
            expect(handlePlayerLeavingGameSpy).toBeCalledWith(socket);
        });
    });

    describe('handleDisconnect', () => {
        it('should call handlePlayerLeavingGame', () => {
            const handlePlayerLeavingGameSpy = jest.spyOn(gateway, 'handlePlayerLeavingGame' as never);
            gateway.handleDisconnect(socket);
            expect(handlePlayerLeavingGameSpy).toBeCalledWith(socket);
        });
    });

    describe('handlePlayerLeavingGame', () => {
        it('should remove level from deletion queue', () => {
            const removeLevelFromDeletionQueueSpy = jest.spyOn(gameService, 'removeLevelFromDeletionQueue');
            gateway['handlePlayerLeavingGame'](socket);
            expect(removeLevelFromDeletionQueueSpy).toBeCalledWith(gameState.levelId);
        });

        it('should emit to the opponent that he has won by default', () => {
            gameState.otherSocketId = '1';
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            const emitSpy = jest.spyOn(socketSecondPlayer, 'emit');
            gateway['handlePlayerLeavingGame'](socket);
            expect(emitSpy).toBeCalledWith('victory');
        });

        it('should delete the user from the game map', () => {
            const deleteUserFromGameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            gateway['handlePlayerLeavingGame'](socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(socket);
        });

        it('should stop the timer', () => {
            const stopTimerSpy = jest.spyOn(timerService, 'stopTimer');
            gateway['handlePlayerLeavingGame'](socket);
            expect(stopTimerSpy).toBeCalledWith(socket.id);
        });
    });
});

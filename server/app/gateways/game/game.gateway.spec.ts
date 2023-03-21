/* eslint-disable max-lines */
import { ChatService } from '@app/services/chat/chat.service';
import { GameService, GameState } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ChatMessage } from '@common/chat-messages';
import { GameData } from '@common/game-data';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Namespace, Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let gameState: GameState;

    let socket: SinonStubbedInstance<Socket>;
    let otherSocket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameService: SinonStubbedInstance<GameService>;
    let timerService: SinonStubbedInstance<TimerService>;
    let chatService: SinonStubbedInstance<ChatService>;

    let emitSpy: jest.SpyInstance;
    let emitOtherSpy: jest.SpyInstance;
    let emitServerSpy: jest.SpyInstance;

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
            isInCheatMode: false,
        };

        timerService = createStubInstance<TimerService>(TimerService);
        gameService = createStubInstance<GameService>(GameService);
        socket = createStubInstance<Socket>(Socket);
        otherSocket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        chatService = createStubInstance<ChatService>(ChatService);

        emitSpy = jest.spyOn(socket, 'emit');
        emitOtherSpy = jest.spyOn(otherSocket, 'emit');
        emitServerSpy = jest.spyOn(server, 'emit');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                ImageService,
                { provide: ChatService, useValue: chatService },
                { provide: GameService, useValue: gameService },
                { provide: TimerService, useValue: timerService },
                { provide: Socket, useValue: socket },
                { provide: Socket, useValue: otherSocket },
                { provide: Server, useValue: server },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        const socketNameSpace = {} as Namespace;
        const socketMaps = new Map<string, Socket>();
        Object.defineProperty(server, 'sockets', { value: socketNameSpace });
        Object.defineProperty(socketNameSpace, 'sockets', { value: socketMaps });
        server.sockets.sockets.get = jest.fn().mockReturnValue(otherSocket);
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
        let timerSpy: jest.SpyInstance;
        let gameSpy: jest.SpyInstance;

        beforeEach(() => {
            timerSpy = jest.spyOn(timerService, 'stopTimer');
            gameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(false);
            jest.spyOn(gateway['server'].sockets.sockets, 'get').mockReturnValue(otherSocket);
        });

        it('should emit back to socket when player clicks', async () => {
            await gateway.onClick(socket, 1);
            expect(emitSpy).toBeCalledWith('processedClick', gameData);
        });

        it('should emit to the opponent when player clicks if they exist', async () => {
            gameState.otherSocketId = '1';
            const spy = jest.spyOn(socket, 'to').mockImplementation(() => ({ emit: jest.fn() } as never));
            await gateway.onClick(socket, 1);
            expect(spy).toBeCalledTimes(1);
        });

        it('should emit a victory event if player wins', async () => {
            jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(true);
            await gateway.onClick(socket, 1);
            expect(emitSpy).toBeCalledWith('processedClick', gameData);
            expect(emitSpy).toBeCalledWith('victory');
            expect(timerSpy).toBeCalledTimes(1);
            expect(gameSpy).toBeCalledTimes(1);
        });

        it('should emit a defeat to the opponent event if player wins', async () => {
            gameState.otherSocketId = '1';
            jest.spyOn(socket, 'to').mockImplementation(() => ({ emit: jest.fn() } as never));
            jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(true);
            await gateway.onClick(socket, 1);
            expect(emitOtherSpy).toBeCalledWith('defeat');
        });
    });

    describe('onGameSelection', () => {
        let createGameStateSpy: jest.SpyInstance;
        let findAvailableGameSpy: jest.SpyInstance;
        let bindPlayersSpy: jest.SpyInstance;

        beforeEach(() => {
            createGameStateSpy = jest.spyOn(gameService, 'createGameState');
            findAvailableGameSpy = jest.spyOn(gameService, 'findAvailableGame');
            bindPlayersSpy = jest.spyOn(gameService, 'bindPlayers');
            jest.spyOn(gateway['server'].sockets.sockets, 'get').mockReturnValue(otherSocket);
        });

        it('should should call createGameState when player selects a game', () => {
            gateway.onGameSelection(socket, { playerName: 'Alice', levelId: 1 });
            expect(createGameStateSpy).toHaveBeenCalledTimes(1);
        });

        it('should should call findAvailableGame when player selects a game', () => {
            gateway.onGameSelection(socket, { playerName: 'Alice', levelId: 1 });
            expect(findAvailableGameSpy).toHaveBeenCalledTimes(1);
        });

        it('should emit back to the player if the name is invalid', () => {
            gateway.onGameSelection(socket, { playerName: '', levelId: 1 });
            expect(emitSpy).toBeCalledWith('invalidName');
        });

        it('should bindPlayers if a match is found', () => {
            gameState.otherSocketId = 'otherId';
            jest.spyOn(gameService, 'findAvailableGame').mockReturnValue('1');
            gateway.onGameSelection(socket, { playerName: 'Alice', levelId: 1 });
            expect(bindPlayersSpy).toBeCalledTimes(1);
        });

        it('should emit back to the player if a match is found', () => {
            gameState.otherSocketId = 'Barbara';
            jest.spyOn(gameService, 'findAvailableGame').mockReturnValue('1');
            gateway.onGameSelection(socket, { playerName: 'Alice', levelId: 1 });
            expect(emitSpy).toBeCalledWith('toBeAccepted');
        });

        it('should emit to the opponent if the player finds a match', () => {
            gameState.otherSocketId = 'Barbara';
            const name = 'Alice';
            jest.spyOn(gameService, 'findAvailableGame').mockReturnValue('1');
            gateway.onGameSelection(socket, { playerName: name, levelId: 1 });
            expect(emitOtherSpy).toBeCalledWith('playerSelection', name);
        });

        it('should update the selection page if player does not find a match', () => {
            const levelId = 1;
            gateway.onGameSelection(socket, { playerName: 'Alice', levelId });
            expect(emitServerSpy).toBeCalledWith('updateSelection', { levelId, canJoin: true });
        });
    });

    describe('onGameAccepted', () => {
        it('should connect both players into each other rooms', () => {
            const connectRoomSpy = jest.spyOn(gameService, 'connectRooms');
            gateway.onGameAccepted(socket);
            expect(connectRoomSpy).toBeCalledWith(socket, otherSocket);
        });

        it('should emit to the player that the game has started', () => {
            const secondGameState: GameState = {
                levelId: 1,
                foundDifferences: [],
                playerName: 'Bob',
                isGameFound: true,
                isInGame: true,
                isInCheatMode: false,
            };
            jest.spyOn(gameService, 'getGameState').mockReturnValueOnce(gameState).mockReturnValueOnce(secondGameState);
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
                isInCheatMode: false,
            };
            jest.spyOn(gameService, 'getGameState').mockReturnValueOnce(gameState).mockReturnValueOnce(secondGameState);
            gateway.onGameAccepted(socket);
            expect(emitOtherSpy).toBeCalledWith('startClassicMultiplayerGame', {
                levelId: gameState.levelId,
                playerName: secondGameState.playerName,
                secondPlayerName: gameState.playerName,
            });
        });

        it('should start the timer', () => {
            const startTimerSpy = jest.spyOn(timerService, 'startTimer');
            gateway.onGameAccepted(socket);
            expect(startTimerSpy).toBeCalledWith(socket.id, server, true, otherSocket.id);
        });

        it('should update the selection page', () => {
            gateway.onGameAccepted(socket);
            expect(emitServerSpy).toBeCalledWith('updateSelection', { levelId: gameState.levelId, canJoin: false });
        });
    });

    describe('onCancelledWhileWaiting', () => {
        it('should update the selection page', () => {
            gateway.onCancelledWhileWaiting(socket);
            expect(emitServerSpy).toBeCalledWith('updateSelection', { levelId: gameState.levelId, canJoin: false });
        });

        it('should delete the user from the game map', () => {
            const deleteUserFromGameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            gateway.onCancelledWhileWaiting(socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(socket);
        });
    });

    describe('onGameRejected', () => {
        it('should update the selection page', () => {
            gateway.onGameRejected(socket);
            expect(emitServerSpy).toBeCalledWith('updateSelection', { levelId: gameState.levelId, canJoin: false });
        });

        it('should delete the user and the opponent from the game map', () => {
            const deleteUserFromGameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            gateway.onGameRejected(socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(otherSocket);
        });

        it('should emit to the opponent that the game has been rejected', () => {
            gateway.onGameRejected(socket);
            expect(emitOtherSpy).toBeCalledWith('rejectedGame');
        });
    });

    describe('onDeleteLevel', () => {
        it('should emit to everyone waiting for a game that the level has been deleted', () => {
            jest.spyOn(gameService, 'getPlayersWaitingForGame').mockReturnValue(['0', '1']);
            jest.spyOn(server.sockets.sockets, 'get').mockReturnValueOnce(socket).mockReturnValueOnce(otherSocket);
            gateway.onDeleteLevel(socket, 1);
            expect(emitSpy).toBeCalledWith('shutDownGame');
            expect(emitOtherSpy).toBeCalledWith('shutDownGame');
        });

        it('should emit to everyone that the level has been deleted', () => {
            jest.spyOn(gameService, 'getPlayersWaitingForGame').mockReturnValue([]);
            gateway.onDeleteLevel(socket, 1);
            expect(emitServerSpy).toBeCalledWith('deleteLevel', 1);
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

    describe('onMessageReception', () => {
        it('should call sendToBothPlayers', () => {
            const message = {} as unknown as ChatMessage;
            const sendToBothPlayersSpy = jest.spyOn(chatService, 'sendToBothPlayers');
            gateway.onMessageReception(socket, message);
            expect(sendToBothPlayersSpy).toBeCalledWith(socket, message, gameService);
        });
    });

    describe('onAbandonGame', () => {
        it('should call handlePlayerLeavingGame', () => {
            const handlePlayerLeavingGameSpy = jest.spyOn(gateway, 'handlePlayerLeavingGame' as never).mockImplementation();
            gateway.onAbandonGame(socket);
            expect(handlePlayerLeavingGameSpy).toBeCalledWith(socket);
        });
    });

    describe('onStartCheatMode', () => {
        it('should call startCheatMode', () => {
            const startCheatModeSpy = jest.spyOn(gameService, 'startCheatMode' as never).mockImplementation();
            gateway.onStartCheatMode(socket);
            expect(startCheatModeSpy).toBeCalledWith(socket.id);
        });
    });

    describe('onStopCheatMode', () => {
        it('should call stopCheatMode', () => {
            const stopCheatModeSpy = jest.spyOn(gameService, 'stopCheatMode' as never).mockImplementation();
            gateway.onStopCheatMode(socket);
            expect(stopCheatModeSpy).toBeCalledWith(socket.id);
        });
    });

    describe('handleDisconnect', () => {
        it('should call handlePlayerLeavingGame', () => {
            const handlePlayerLeavingGameSpy = jest.spyOn(gateway, 'handlePlayerLeavingGame' as never).mockImplementation();
            gateway.handleDisconnect(socket);
            expect(handlePlayerLeavingGameSpy).toBeCalledWith(socket);
        });
    });

    describe('handlePlayerLeavingGame', () => {
        let removeLevelFromDeletionQueueSpy: jest.SpyInstance;
        let deleteUserFromGameSpy: jest.SpyInstance;
        let stopTimerSpy: jest.SpyInstance;
        let abandonMessageSpy: jest.SpyInstance;
        let getGameStateSpy: jest.SpyInstance;

        beforeEach(() => {
            removeLevelFromDeletionQueueSpy = jest.spyOn(gameService, 'removeLevelFromDeletionQueue');
            deleteUserFromGameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            stopTimerSpy = jest.spyOn(timerService, 'stopTimer');
            abandonMessageSpy = jest.spyOn(chatService, 'abandonMessage');
            getGameStateSpy = jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            jest.spyOn(gateway['server'].sockets.sockets, 'get').mockReturnValue(otherSocket);
        });

        it('should call getGameState', () => {
            gateway['handlePlayerLeavingGame'](socket);
            expect(getGameStateSpy).toBeCalledWith(socket.id);
        });

        it('should call removeLevelFromDeletionQueue if gameState is defined', () => {
            gateway['handlePlayerLeavingGame'](socket);
            expect(removeLevelFromDeletionQueueSpy).toBeCalledWith(gameState.levelId);
        });

        it('should call abandonMessage if the other socket id is defined', () => {
            gameState.otherSocketId = '1';
            gateway['handlePlayerLeavingGame'](socket);
            expect(abandonMessageSpy).toBeCalledWith(socket, gameService);
        });

        it('should emit an abandon event', () => {
            gameState.otherSocketId = '1';
            gateway['handlePlayerLeavingGame'](socket);
            expect(emitOtherSpy).toBeCalledWith('opponentAbandoned');
        });

        it('should delete the user from the game map', () => {
            gateway['handlePlayerLeavingGame'](socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(socket);
        });

        it('should stop the timer', () => {
            gateway['handlePlayerLeavingGame'](socket);
            expect(stopTimerSpy).toBeCalledWith(socket.id);
        });
    });
});

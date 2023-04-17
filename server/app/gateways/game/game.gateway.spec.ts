/* eslint-disable max-lines */
import { ChatService } from '@app/services/chat/chat.service';
import { GameService, GameState } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ChatMessage } from '@common/chat-messages';
import { GameData } from '@common/game-data';
import { Test, TestingModule } from '@nestjs/testing';
import { Level } from 'assets/data/level';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
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
            amountOfDifferencesFound: 0,
            playerName: 'Alice',
            isInGame: false,
            isGameFound: false,
            isInCheatMode: false,
            hintsUsed: 0,
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
        jest.spyOn(server, 'to').mockReturnValue(socket as never);

        const broadcast = {
            to: jest.fn(() => {
                return otherSocket;
            }),
        };

        Object.defineProperty(socket, 'broadcast', { value: broadcast });
        Object.defineProperty(otherSocket, 'broadcast', { value: broadcast });

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

        it('should handle timed game mode if player does not win', async () => {
            gameState.timedLevelList = [{} as Level];
            gameData.differencePixels = [1, 2, 3];
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));

            const handleTimedGameSpy = jest.spyOn(gateway, 'handleTimedGame' as never).mockImplementation(() => ({ emit: jest.fn() } as never));
            await gateway.onClick(socket, 1);
            expect(handleTimedGameSpy).toBeCalledWith(socket, gameState);
        });

        it('should emit to the opponent when player clicks', async () => {
            gameState.otherSocketId = '1';
            gameData.differencePixels = [0, 1, 2];
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
            await gateway.onClick(socket, 1);
            expect(emitOtherSpy).toBeCalledTimes(1);
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
                amountOfDifferencesFound: 0,
                playerName: 'Bob',
                isGameFound: true,
                isInGame: true,
                isInCheatMode: false,
                hintsUsed: 0,
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
                amountOfDifferencesFound: 0,
                playerName: 'Bob',
                isGameFound: true,
                isInGame: true,
                isInCheatMode: false,
                hintsUsed: 0,
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
            const startTimerSpy = jest.spyOn(timerService, 'startTimer').mockImplementation();
            gateway.onGameAccepted(socket);
            expect(startTimerSpy).toBeCalledWith({ socket, otherSockerId: otherSocket.id }, server, true);
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
            const deleteUserFromGameSpy = jest.spyOn(gameService, 'deleteUserFromGame').mockImplementation();
            gateway.onCancelledWhileWaiting(socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(socket);
        });
    });

    describe('onGameRejected', () => {
        it('should update the selection page', () => {
            gateway.onGameRejected(socket);
            expect(emitServerSpy).toBeCalledWith('updateSelection', { levelId: gameState.levelId, canJoin: true });
        });

        it('should delete the user and the opponent from the game map', () => {
            const deleteUserFromGameSpy = jest.spyOn(gameService, 'deleteUserFromGame').mockImplementation();
            gateway.onGameRejected(socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(otherSocket);
        });

        it('should call cancelGame function', () => {
            const cancelMatchSpy = jest.spyOn(gateway, 'cancelGame' as never);
            gateway.onGameRejected(socket);
            expect(cancelMatchSpy).toBeCalled();
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

        it('should call removeLevel function', () => {
            const levelId = 1;
            const spy = jest.spyOn(gameService, 'removeLevel').mockImplementation();
            jest.spyOn(gameService, 'getPlayersWaitingForGame').mockReturnValue([]);
            gateway.onDeleteLevel(socket, levelId);
            expect(spy).toBeCalledWith(levelId, true);
        });
    });

    describe('onMessageReception', () => {
        let getGameStateSpy: jest.SpyInstance;
        let sendToBothPlayersSpy: jest.SpyInstance;

        beforeEach(() => {
            getGameStateSpy = jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            sendToBothPlayersSpy = jest.spyOn(chatService, 'sendToBothPlayers');
        });

        it('should call getGameState', () => {
            const message = {} as unknown as ChatMessage;
            gateway.onMessageReception(socket, message);
            expect(getGameStateSpy).toBeCalledWith(socket.id);
        });

        it('should call sendToBothPlayers', () => {
            const message = {} as unknown as ChatMessage;
            gateway.onMessageReception(socket, message);
            expect(sendToBothPlayersSpy).toBeCalledWith(socket, message, gameState);
        });
    });

    describe('onAbandonGame', () => {
        it('should call handlePlayerLeavingGame', () => {
            const handlePlayerLeavingGameSpy = jest.spyOn(gateway, 'handlePlayerLeavingGame' as never);
            gateway.onAbandonGame(socket);
            expect(handlePlayerLeavingGameSpy).toBeCalledWith(socket);
        });
    });

    describe('onStartCheatMode', () => {
        it('should call startCheatMode', () => {
            const startCheatModeSpy = jest.spyOn(gameService, 'startCheatMode' as never);
            gateway.onStartCheatMode(socket);
            expect(startCheatModeSpy).toBeCalledWith(socket.id);
        });
    });

    describe('onStopCheatMode', () => {
        it('should call stopCheatMode', () => {
            const stopCheatModeSpy = jest.spyOn(gameService, 'stopCheatMode' as never);
            gateway.onStopCheatMode(socket);
            expect(stopCheatModeSpy).toBeCalledWith(socket.id);
        });
    });

    describe('onHintRequest', () => {
        it('should call chatService, timerService and askHint', async () => {
            gameState.timedLevelList = undefined;
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            jest.spyOn(timerService, 'getCurrentTime').mockReturnValue(1);
            const sendMessageSpy = jest.spyOn(chatService, 'sendMessageToPlayer');
            const askHintSpy = jest.spyOn(gameService, 'askHint').mockReturnValue(Promise.resolve([1, 2]));
            const addTimeSpy = jest.spyOn(timerService, 'addTime');
            await gateway.onHintRequest(socket);
            expect(emitSpy).toHaveBeenCalledWith('hintRequest', [1, 2]); // check the emitted event
            expect(sendMessageSpy).toBeCalledWith(socket, 'Indice utilisé');
            expect(askHintSpy).toBeCalledWith(socket.id);
            expect(addTimeSpy).toBeCalledWith(gateway['server'], socket.id, expect.any(Number));
            expect(addTimeSpy.mock.calls[0][2]).toBeGreaterThan(0);
        });

        it('should decrement timer when in timed game mode', async () => {
            gameState.timedLevelList = [{} as Level];
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            jest.spyOn(timerService, 'getCurrentTime').mockReturnValue(1);
            jest.spyOn(gameService, 'askHint').mockReturnValue(Promise.resolve([1, 2]));
            jest.spyOn(chatService, 'sendMessageToPlayer');
            const addTimeSpy = jest.spyOn(timerService, 'addTime');
            await gateway.onHintRequest(socket);
            expect(addTimeSpy).toBeCalledWith(gateway['server'], socket.id, expect.any(Number));
            expect(addTimeSpy.mock.calls[0][2]).toBeLessThan(0);
        });
    });

    describe('handleDisconnect', () => {
        it('should call handlePlayerLeavingGame', () => {
            const handlePlayerLeavingGameSpy = jest.spyOn(gateway, 'handlePlayerLeavingGame' as never);
            gateway.handleDisconnect(socket);
            expect(handlePlayerLeavingGameSpy).toBeCalledWith(socket);
        });
    });

    describe('onGameCancelled', () => {
        it('should call cancelGame', () => {
            const cancelGameSpy = jest.spyOn(gateway, 'cancelGame' as never);
            gateway.onGameCancelled(socket);
            expect(cancelGameSpy).toBeCalledWith(socket);
        });

        it('should update the selection page', () => {
            gateway.onGameCancelled(socket);
            expect(emitServerSpy).toBeCalledWith('updateSelection', { levelId: gameState.levelId, canJoin: false });
        });

        it('should emit to the opponent that the game has been cancelled', () => {
            const deletePlayerSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            gateway.onGameCancelled(socket);
            expect(deletePlayerSpy).toBeCalledWith(socket);
        });
    });

    describe('handlePlayerLeavingGame', () => {
        let removeLevelFromDeletionQueueSpy: jest.SpyInstance;
        let deleteUserFromGameSpy: jest.SpyInstance;
        let stopTimerSpy: jest.SpyInstance;
        let abandonMessageSpy: jest.SpyInstance;
        let getGameStateSpy: jest.SpyInstance;

        beforeEach(() => {
            removeLevelFromDeletionQueueSpy = jest.spyOn(gameService, 'removeLevel');
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
            expect(removeLevelFromDeletionQueueSpy).toBeCalledWith(gameState.levelId, false);
        });

        it('should call abandonMessage if the other socket id is defined', () => {
            gameState.otherSocketId = '1';
            gateway['handlePlayerLeavingGame'](socket);
            expect(abandonMessageSpy).toBeCalledWith(socket, gameState);
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

    describe('cancelGame', () => {
        it('should emit to the opponent that the game has been cancelled', () => {
            const secondPlayerEmit = jest.spyOn(otherSocket, 'emit');
            gateway['cancelGame'](socket);
            expect(secondPlayerEmit).toBeCalledWith('rejectedGame');
        });
    });

    describe('onCreateTimedGame', () => {
        it('should start the timer', async () => {
            const level = { id: 1 } as Level;
            jest.spyOn(gameService, 'createGameState').mockImplementation();
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue(level);
            jest.spyOn(gameService, 'setLevelId').mockImplementation();
            const timerSpy = jest.spyOn(timerService, 'startTimer');
            await gateway.onCreateTimedGame(socket, { multiplayer: true, playerName: '' });
            expect(timerSpy).toBeCalled();
        });

        it('should emit a random level to the user', async () => {
            const level = { id: 1 } as Level;
            jest.spyOn(gameService, 'createGameState').mockImplementation();
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue(level);
            jest.spyOn(gameService, 'setLevelId').mockImplementation();
            await gateway.onCreateTimedGame(socket, { multiplayer: true, playerName: '' });
            expect(emitSpy).toBeCalledWith('changeLevelTimedMode', level);
        });
    });

    describe('handleTimedGame', () => {
        it('should add time', () => {
            gameState.timedLevelList = [{} as Level];
            const addTimeSpy = jest.spyOn(timerService, 'addTime').mockImplementation();
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue({ id: 1 } as Level);
            jest.spyOn(gameService, 'setLevelId').mockImplementation();
            gateway['handleTimedGame'](socket, gameState);
            expect(addTimeSpy).toBeCalled();
        });
        it('should stop the timer, delete the user and emit to the player if he wins the game', () => {
            const stopTimerSpy = jest.spyOn(timerService, 'stopTimer').mockImplementation();
            const deleteUserSpy = jest.spyOn(gameService, 'deleteUserFromGame').mockImplementation();
            gameState.timedLevelList = [];
            gateway['handleTimedGame'](socket, gameState);
            expect(stopTimerSpy).toBeCalled();
            expect(deleteUserSpy).toBeCalled();
            expect(emitSpy).toBeCalled();
        });
        it('should return true of game is won', () => {
            jest.spyOn(timerService, 'stopTimer').mockImplementation();
            jest.spyOn(gameService, 'deleteUserFromGame').mockImplementation();
            gameState.timedLevelList = [];
            expect(gateway['handleTimedGame'](socket, gameState)).toBeTruthy();
        });

        it('should return false of game is not won', () => {
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue({ id: 1 } as Level);
            jest.spyOn(gameService, 'setLevelId').mockImplementation();
            gameState.timedLevelList = [{} as Level];
            expect(gateway['handleTimedGame'](socket, gameState)).toBeFalsy();
        });

        it('should set a new level if the game is not finished', () => {
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue({ id: 1 } as Level);
            const setLevelSpy = jest.spyOn(gameService, 'setLevelId').mockImplementation();
            gameState.timedLevelList = [{} as Level];
            gateway['handleTimedGame'](socket, gameState);
            expect(setLevelSpy).toBeCalledWith(socket.id, 1);
        });
    });
});

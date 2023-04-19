/* eslint-disable max-lines */
import { Level, levelModel } from '@app/model/schema/level.schema';
import { ChatService } from '@app/services/chat/chat.service';
import { GameService, GameState } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ChatMessage } from '@common/interfaces/chat-messages';
import { GameData } from '@common/interfaces/game-data';
import { Level as LevelDataObject } from '@common/interfaces/level';
import { TestConstants } from '@common/test-constants';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, restore } from 'sinon';
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
    let mongodbService: SinonStubbedInstance<MongodbService>;

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
        mongodbService = createStubInstance<MongodbService>(MongodbService);

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
                { provide: MongodbService, useValue: mongodbService },
                { provide: Socket, useValue: socket },
                { provide: Socket, useValue: otherSocket },
                { provide: Server, useValue: server },
                {
                    provide: getModelToken(Level.name),
                    useValue: levelModel,
                },
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

    afterEach(() => {
        restore();
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
        let addGameHistorySpy: jest.SpyInstance;

        beforeEach(() => {
            timerSpy = jest.spyOn(timerService, 'stopTimer');
            gameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
            jest.spyOn(mongodbService, 'updateHighscore').mockReturnValue(Promise.resolve(2));
            jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
            jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(false);
            addGameHistorySpy = jest.spyOn(mongodbService, 'addGameHistory').mockImplementation(jest.fn());
            jest.spyOn(gateway['server'].sockets.sockets, 'get').mockReturnValue(otherSocket);
        });

        it('should emit back to socket when player clicks', async () => {
            await gateway.onClick(socket, 1);
            expect(emitSpy).toBeCalledWith('processedClick', gameData);
        });

        it('should handle timed game mode if player does not win', async () => {
            gameState.timedLevelList = [{} as LevelDataObject];
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

            expect(emitSpy).toBeCalledWith('victory', 2);
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

        it('should call mongodb service addGameHistory', async () => {
            gameState.timedLevelList = [
                {
                    id: 1,
                    name: 'Juan Cena',
                    playerSolo: TestConstants.PLAYER_ARRAY_SOLO_DATA_BASE,
                    timeSolo: TestConstants.TIME_ARRAY_SOLO_DATA_BASE,
                    playerMulti: TestConstants.PLAYER_ARRAY_MULTI_DATA_BASE,
                    timeMulti: TestConstants.TIME_ARRAY_MULTI_DATA_BASE,
                    isEasy: false,
                    nbDifferences: TestConstants.HARD_LEVEL_NB_DIFFERENCES,
                    canJoin: true,
                } as LevelDataObject,
            ];
            jest.spyOn(gateway, 'handleTimedGame' as never).mockReturnValue(false as never);
            jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(true);
            await gateway.onClick(socket, 1);
            expect(addGameHistorySpy).toHaveBeenCalledTimes(1);
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

    describe('onDeleteAllLevels', () => {
        it('should call getAllLevelsSpy', () => {
            jest.spyOn(gateway, 'onDeleteLevel').mockImplementation();
            const getAllLevelsSpy = jest.spyOn(mongodbService, 'getAllLevels').mockResolvedValue([{} as Level] as Level[]);
            gateway.onDeleteAllLevels(socket);
            expect(getAllLevelsSpy).toBeCalledTimes(1);
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
        let getCurrentTimeSpy: jest.SpyInstance;
        let getGameStateSpy: jest.SpyInstance;
        let askHintSpy: jest.SpyInstance;
        let sendMessageSpy: jest.SpyInstance;
        let addTimeSpy: jest.SpyInstance;

        beforeEach(() => {
            gameState.timedLevelList = [{} as Level];
            getCurrentTimeSpy = jest.spyOn(timerService, 'getCurrentTime').mockReturnValue(1);
            askHintSpy = jest.spyOn(gameService, 'askHint').mockReturnValue(Promise.resolve([1, 2]));
            getGameStateSpy = jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
            sendMessageSpy = jest.spyOn(chatService, 'sendMessageToPlayer');
            addTimeSpy = jest.spyOn(timerService, 'addTime');
        });

        it('should call getCurrentTime', async () => {
            await gateway.onHintRequest(socket);
            expect(getCurrentTimeSpy).toBeCalledTimes(1);
        });

        it('should call askHint', async () => {
            await gateway.onHintRequest(socket);
            expect(askHintSpy).toBeCalledTimes(1);
        });

        it('should add time to the timer ', async () => {
            const expectedTime = 5;
            await gateway.onHintRequest(socket);
            expect(addTimeSpy).toHaveBeenCalledWith(gateway['server'], socket.id, expectedTime);
        });

        it('should subtract time to the timer ', async () => {
            gameState.timedLevelList = undefined;
            const expectedTime = -5;
            await gateway.onHintRequest(socket);
            expect(addTimeSpy).toHaveBeenCalledWith(gateway['server'], socket.id, -expectedTime);
        });

        it('should call sendMessageToPlayer', async () => {
            await gateway.onHintRequest(socket);
            expect(sendMessageSpy).toBeCalledTimes(1);
        });

        it('should call getGameState', async () => {
            await gateway.onHintRequest(socket);
            expect(getGameStateSpy).toBeCalledTimes(1);
        });

        it('should call emit', async () => {
            await gateway.onHintRequest(socket);
            expect(emitSpy).toBeCalledTimes(1);
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
            jest.spyOn(timerService, 'getStartDate').mockReturnValue(new Date());
            jest.spyOn(gateway['server'].sockets.sockets, 'get').mockReturnValue(otherSocket);
            jest.spyOn(mongodbService, 'addGameHistory').mockImplementation(jest.fn());
        });

        it('should call getGameState', () => {
            gateway['handlePlayerLeavingGame'](socket);
            expect(getGameStateSpy).toBeCalledWith(socket.id);
        });

        it('should call removeLevelFromDeletionQueue if gameState is defined', async () => {
            await gateway['handlePlayerLeavingGame'](socket);
            expect(removeLevelFromDeletionQueueSpy).toBeCalledWith(gameState.levelId, false);
        });

        it('should call abandonMessage if the other socket id is defined', async () => {
            gameState.otherSocketId = '1';
            await gateway['handlePlayerLeavingGame'](socket);
            expect(abandonMessageSpy).toBeCalledWith(socket, gameState);
        });

        it('should emit an abandon event', async () => {
            gameState.otherSocketId = '1';
            await gateway['handlePlayerLeavingGame'](socket);
            expect(emitOtherSpy).toBeCalledWith('opponentAbandoned');
        });

        it('should delete the user from the game map', async () => {
            await gateway['handlePlayerLeavingGame'](socket);
            expect(deleteUserFromGameSpy).toBeCalledWith(socket);
        });

        it('should stop the timer', async () => {
            await gateway['handlePlayerLeavingGame'](socket);
            expect(stopTimerSpy).toBeCalledWith(socket.id);
        });

        it('should call add game history', async () => {
            gameState.timedLevelList = [
                {
                    id: 1,
                    name: 'Juan Cena',
                    playerSolo: TestConstants.PLAYER_ARRAY_SOLO_DATA_BASE,
                    timeSolo: TestConstants.TIME_ARRAY_SOLO_DATA_BASE,
                    playerMulti: TestConstants.PLAYER_ARRAY_MULTI_DATA_BASE,
                    timeMulti: TestConstants.TIME_ARRAY_MULTI_DATA_BASE,
                    isEasy: false,
                    nbDifferences: TestConstants.HARD_LEVEL_NB_DIFFERENCES,
                    canJoin: true,
                } as LevelDataObject,
            ];
            const addGameHistorySpy = jest.spyOn(mongodbService, 'addGameHistory');
            await gateway['handlePlayerLeavingGame'](socket);
            expect(addGameHistorySpy).toHaveBeenCalledTimes(1);
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
            const level = { id: 1 } as LevelDataObject;
            jest.spyOn(gameService, 'createGameState').mockImplementation();
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue(level);
            jest.spyOn(gameService, 'setLevelId').mockImplementation();
            const timerSpy = jest.spyOn(timerService, 'startTimer');
            await gateway.onCreateTimedGame(socket, { multiplayer: true, playerName: '' });
            expect(timerSpy).toBeCalled();
        });

        it('should emit a random level to the user', async () => {
            const level = { id: 1 } as LevelDataObject;
            jest.spyOn(gameService, 'createGameState').mockImplementation();
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue(level);
            jest.spyOn(gameService, 'setLevelId').mockImplementation();
            await gateway.onCreateTimedGame(socket, { multiplayer: true, playerName: '' });
            expect(emitSpy).toBeCalledWith('changeLevelTimedMode', level);
        });
    });

    describe('handleTimedGame', () => {
        let addGameHistorySpy: jest.SpyInstance;

        beforeEach(() => {
            jest.spyOn(timerService, 'getStartDate').mockReturnValue(new Date());
            addGameHistorySpy = jest.spyOn(mongodbService, 'addGameHistory').mockImplementation(jest.fn());
        });

        it('should add time', () => {
            gameState.timedLevelList = [{} as LevelDataObject];
            const addTimeSpy = jest.spyOn(timerService, 'addTime').mockImplementation();
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue({ id: 1 } as LevelDataObject);
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
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue({ id: 1 } as LevelDataObject);
            jest.spyOn(gameService, 'setLevelId').mockImplementation();
            gameState.timedLevelList = [{} as LevelDataObject];
            expect(gateway['handleTimedGame'](socket, gameState)).toBeFalsy();
        });

        it('should set a new level if the game is not finished', () => {
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue({ id: 1 } as LevelDataObject);
            const setLevelSpy = jest.spyOn(gameService, 'setLevelId').mockImplementation();
            gameState.timedLevelList = [{} as LevelDataObject];
            gateway['handleTimedGame'](socket, gameState);
            expect(setLevelSpy).toBeCalledWith(socket.id, 1);
        });

        it('should call addGameHistory from mongodb service', () => {
            jest.spyOn(gameService, 'getRandomLevelForTimedGame').mockReturnValue({ id: 1 } as LevelDataObject);
            jest.spyOn(gameService, 'setLevelId').mockImplementation();
            gameState.timedLevelList = [];
            gameState.otherSocketId = 'socket2';
            gateway['handleTimedGame'](socket, gameState);
            expect(addGameHistorySpy).toHaveBeenCalledTimes(1);
        });
    });
});

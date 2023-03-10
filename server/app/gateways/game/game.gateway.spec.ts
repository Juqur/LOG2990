import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway, GameState } from './game.gateway';
import { ImageService } from '@app/services/image/image.service';
import { BroadcastOperator, Namespace, Server, Socket } from 'socket.io';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';
import { GameEvents } from './game.gateway.events';
import { IoAdapter } from '@nestjs/platform-socket.io';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let socket: SinonStubbedInstance<Socket>;
    let secondSocket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        const broadcastMock = {} as BroadcastOperator<unknown, unknown>;
        broadcastMock.emit = jest.fn();
        broadcastMock.to = jest.fn();

        const roomMap = new Map();
        roomMap.set('0', { size: 1 });

        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        secondSocket = createStubInstance<Socket>(Socket);

        Object.defineProperty(socket, 'id', { value: '0' });
        Object.defineProperty(secondSocket, 'id', { value: '1' });
        Object.defineProperty(server, 'sockets', { value: {} as Namespace });
        Object.defineProperty(server.sockets, 'adapter', { value: {} as IoAdapter });
        Object.defineProperty(socket, 'broadcast', { value: broadcastMock });
        Object.defineProperty(server.sockets.adapter, 'rooms', { value: roomMap });

        jest.spyOn(server, 'to').mockReturnValue(broadcastMock);
        jest.spyOn(socket.broadcast, 'to').mockReturnValue(broadcastMock);
        jest.spyOn(global.Math, 'random').mockReturnValue(0);

        const module: TestingModule = await Test.createTestingModule({
            providers: [GameGateway, ImageService],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
        gateway['playerRoomMap'].clear();
        gateway['playerGameMap'].clear();
        for (const interval of gateway['timeIntervalMap'].values()) {
            clearInterval(interval);
        }
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should add a player into all maps when he joins a new game', () => {
        const gameSate: GameState = { gameId: 'gameId', foundDifferences: [], playerName: 'playerName', secondPlayerId: '' };
        gateway.onJoinNewGame(socket, { game: 'gameId', playerName: 'playerName' });
        expect(gateway['playerRoomMap'].get(socket.id)).toEqual(0);
        expect(gateway['playerGameMap'].get(socket.id)).toEqual(gameSate);
        expect(gateway['timeMap'].get(socket.id)).toEqual(0);
        const interval = gateway['timeIntervalMap'].get(socket.id);
        expect(typeof interval).toBe('object');
    });

    it('should emit a timer event with the current time when in a solo game', () => {
        jest.useFakeTimers();
        const emitSpy = jest.spyOn(socket, 'emit');
        gateway.onJoinNewGame(socket, { game: 'gameId', playerName: 'playerName' });
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(emitSpy).toHaveBeenCalledWith(GameEvents.SendTime, 1);

        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(emitSpy).toHaveBeenCalledWith(GameEvents.SendTime, 2);

        const interval = gateway['timeIntervalMap'].get(socket.id);
        clearInterval(interval as NodeJS.Timeout);
    });

    it('should create a room and add a player into all maps if a room does not already exist in a multiplayer game', () => {
        const gameSate: GameState = { gameId: 'gameId', foundDifferences: [], playerName: 'playerName', secondPlayerId: '' };
        gateway.onJoinMultiplayerGame(socket, { game: 'gameId', playerName: 'playerName' });
        expect(gateway['playerRoomMap'].get(socket.id)).toEqual(0);
        expect(gateway['playerGameMap'].get(socket.id)).toEqual(gameSate);
    });

    it('should not start timer if a room does not already exist in a multiplayer game', () => {
        gateway.onJoinMultiplayerGame(socket, { game: 'gameId', playerName: 'playerName' });
        expect(gateway['timeMap'].get(socket.id)).not.toEqual(0);
    });

    it('should emit a timer event with the current time when in a multiplayer game', () => {
        jest.useFakeTimers();
        const emitSpy = jest.spyOn(server.to('0'), 'emit');
        gateway.onJoinMultiplayerGame(socket, { game: 'gameId', playerName: 'player1' });
        gateway.onJoinMultiplayerGame(secondSocket, { game: 'gameId', playerName: 'player2' });

        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(emitSpy).toHaveBeenCalledWith(GameEvents.SendTime, 1);

        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(emitSpy).toHaveBeenCalledWith(GameEvents.SendTime, 2);

        const interval = gateway['timeIntervalMap'].get(socket.id);
        clearInterval(interval as NodeJS.Timeout);
    });

    it('should make a player join an existing room in a multiplayer game if the game already exists', () => {
        gateway.onJoinMultiplayerGame(socket, { game: 'gameId', playerName: 'player1' });
        gateway.onJoinMultiplayerGame(secondSocket, { game: 'gameId', playerName: 'player2' });
        expect(secondSocket.join.calledWith('0')).toBeTruthy();
    });

    it('should add both players to correct maps when they join a multiplayer game', () => {
        const gameSate: GameState = { gameId: 'gameId', foundDifferences: [], playerName: 'player2', secondPlayerId: socket.id };
        gateway.onJoinMultiplayerGame(socket, { game: 'gameId', playerName: 'player1' });
        gateway.onJoinMultiplayerGame(secondSocket, { game: 'gameId', playerName: 'player2' });
        expect(gateway['playerRoomMap'].get(secondSocket.id)).toEqual(0);
        expect(gateway['playerGameMap'].get(secondSocket.id)).toEqual(gameSate);
        expect(gateway['playerGameMap'].get(socket.id).secondPlayerId).toEqual(secondSocket.id);
    });

    it('should call findDifference when onClick is called', async () => {
        const findDifferenceSpy = jest.spyOn(gateway['imageService'], 'findDifference');
        gateway.onJoinNewGame(socket, { game: '1', playerName: 'playerName' });
        await gateway.onClick(socket, { position: 1 });
        expect(findDifferenceSpy).toHaveBeenCalled();
    });

    it('should emit the response to the socket that sent the call', async () => {
        gateway.onJoinNewGame(socket, { game: '1', playerName: 'playerName' });
        await gateway.onClick(socket, { position: 1 });
        expect(socket.emit.called).toBeTruthy();
    });

    it('should emit the response to the second player if the game is multiplayer', async () => {
        const rep = { foundDifference: [1], won: true };
        jest.spyOn(gateway['imageService'], 'findDifference').mockReturnValue(Promise.resolve(rep));
        gateway.onJoinMultiplayerGame(socket, { game: '1', playerName: 'player1' });
        gateway.onJoinMultiplayerGame(secondSocket, { game: '1', playerName: 'player2' });
        await gateway.onClick(socket, { position: 1 });
        expect(socket.emit.called).toBeTruthy();
    });

    it('should delete the player from maps if he wins', async () => {
        const rep = { foundDifference: [1], won: true };
        jest.spyOn(gateway['imageService'], 'findDifference').mockReturnValue(Promise.resolve(rep));
        gateway.onJoinNewGame(socket, { game: '1', playerName: 'playerName' });
        await gateway.onClick(socket, { position: 1 });
        expect(gateway['playerRoomMap'].get(socket.id)).toBeUndefined();
        expect(gateway['playerGameMap'].get(socket.id)).toBeUndefined();
    });

    it('should delete the player from all maps if socket disconnects', () => {
        gateway.onJoinNewGame(socket, { game: '1', playerName: 'playerName' });
        gateway.handleDisconnect(socket);
        expect(gateway['playerRoomMap'].get(socket.id)).toBeUndefined();
        expect(gateway['playerGameMap'].get(socket.id)).toBeUndefined();
        expect(gateway['timeMap'].get(socket.id)).toBeUndefined();
        expect(gateway['timeIntervalMap'].get(socket.id)).toBeUndefined();
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { ImageService } from '@app/services/image/image.service';
import { Namespace, Server, Socket } from 'socket.io';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { GameState } from '@app/services/game/game.service';
import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';
import { GameEvents } from './game.gateway.events';
import { IoAdapter } from '@nestjs/platform-socket.io';
describe('GameGateway', () => {
    let gateway: GameGateway;
    let socket: SinonStubbedInstance<Socket>;
    let secondSocket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        Object.defineProperty(socket, 'id', { value: '0' });
        secondSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(secondSocket, 'id', { value: '1' });
        server = createStubInstance<Server>(Server);
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

    it('should make a player join an existing room in a multiplayer game if the game already exists', () => {
        const gameSate: GameState = { gameId: 'gameId', foundDifferences: [], playerName: 'playerName', secondPlayerId: socket.id };
        Object.defineProperty(server, 'sockets', { value: {} as Namespace });
        Object.defineProperty(server.sockets, 'adapter', { value: {} as IoAdapter });
        const roomMap = new Map();
        roomMap.set('0', 1);
        Object.defineProperty(server.sockets.adapter, 'rooms', { value: roomMap });
        gateway.onJoinMultiplayerGame(socket, { game: 'gameId', playerName: 'playerName' });
        gateway.onJoinMultiplayerGame(secondSocket, { game: 'gameId', playerName: 'playerName' });
        expect(gateway['playerRoomMap'].get(secondSocket.id)).toEqual(0);
        expect(gateway['playerGameMap'].get(secondSocket.id)).toEqual(gameSate);
    });
});

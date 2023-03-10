import { ImageService } from '@app/services/image/image.service';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Namespace, Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';

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
        roomMap.set(0, { size: 1 });

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
});

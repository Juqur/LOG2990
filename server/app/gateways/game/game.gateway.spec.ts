import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { ImageService } from '@app/services/image/image.service';
import { Server, Socket } from 'socket.io';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameState } from '@app/services/game/game.service';
import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';
import { GameEvents } from './game.gateway.events';
describe('GameGateway', () => {
    let gateway: GameGateway;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        jest.spyOn(global.Math, 'random').mockReturnValue(0);
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameGateway, ImageService],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
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

    it('should emit a timer event with the current time', () => {
        gateway.onJoinNewGame(socket, { game: 'gameId', playerName: 'playerName' });
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(socket.emit).toHaveBeenCalledWith(GameEvents.SendTime, 1);

        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(socket.emit).toHaveBeenCalledWith(GameEvents.SendTime, 2);

        const interval = gateway['timeIntervalMap'].get(socket.id);
        clearInterval(interval as NodeJS.Timeout);

    });
});

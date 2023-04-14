import { GameService, GameState } from '@app/services/game/game.service';
import { Constants } from '@common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { TimerService } from './timer.service';

jest.useFakeTimers();

describe('TimerService', () => {
    let service: TimerService;
    let server: SinonStubbedInstance<Server>;
    let socket: SinonStubbedInstance<Socket>;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        server = createStubInstance<Server>(Server);
        socket = createStubInstance<Socket>(Socket);
        gameService = createStubInstance<GameService>(GameService);

        Object.defineProperty(socket, 'id', { value: 'socket' });

        jest.spyOn(server, 'to').mockReturnValue(socket as never);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimerService,
                { provide: GameService, useValue: gameService },
                { provide: Socket, useValue: socket },
                { provide: Server, useValue: server },
            ],
        }).compile();

        service = module.get<TimerService>(TimerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getTime', () => {
        it('should return the time of the player', () => {
            const expectedTime = 10;
            service['timeMap'].set('socket', expectedTime);
            expect(service.getTime('socket')).toEqual(expectedTime);
        });
    });

    describe('startTimer ', () => {
        let removeSpy: jest.SpyInstance;
        let deleteSpy: jest.SpyInstance;

        beforeEach(() => {
            removeSpy = jest.spyOn(gameService, 'removeLevel').mockImplementation();
            deleteSpy = jest.spyOn(gameService, 'deleteUserFromGame').mockImplementation();
            jest.spyOn(gameService, 'getGameState').mockReturnValue({ levelId: 0 } as unknown as GameState);
        });

        it('should start the timer for a single player game', () => {
            const expectedTime = 0;
            service.startTimer({ socket }, server, true);
            expect(service['timeMap'].get('socket')).toEqual(expectedTime);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
        });

        it('should start the timer for a multiplayer game', () => {
            const expectedTime = 120;
            service.startTimer({ socket, otherSocketId: 'secondSocket' }, server, false);
            expect(service['timeMap'].get('socket')).toEqual(expectedTime);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
            expect(service['timeIntervalMap'].get('secondSocket')).toBeDefined();
        });

        it('should emit the time every second', () => {
            const emitSpy = jest.fn();
            const toSpy = jest.spyOn(server, 'to').mockReturnValue({ emit: emitSpy } as never);
            const timeToAdvance = 1000;
            service.startTimer({ socket }, server, true);
            jest.advanceTimersByTime(timeToAdvance);
            expect(toSpy).toBeCalledTimes(1);
            expect(emitSpy).toBeCalledTimes(1);
        });

        it('should set the time to the the timed game mode time', () => {
            service.startTimer({ socket }, server, false);
            expect(service['timeMap'].get('socket')).toEqual(Constants.TIMED_GAME_MODE_LENGTH);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
        });

        it('should decrement the time every second', () => {
            const timeToAdvance = 1000;
            service.startTimer({ socket }, server, false);
            jest.advanceTimersByTime(timeToAdvance);
            expect(service['timeMap'].get('socket')).toEqual(Constants.TIMED_GAME_MODE_LENGTH - 1);
        });

        it('should delete user from maps if time is 0', async () => {
            const spy = jest.spyOn(service, 'stopTimer').mockImplementation();
            const timeToAdvance = 1000;
            service.startTimer({ socket }, server, false);
            jest.advanceTimersByTime(timeToAdvance * (Constants.TIMED_GAME_MODE_LENGTH + 1));
            expect(spy).toBeCalledTimes(1);
        });

        it('should try to remove level at the end of the timer', () => {
            jest.spyOn(service, 'stopTimer').mockImplementation();
            const timeToAdvance = 1000;
            service.startTimer({ socket }, server, false);
            jest.advanceTimersByTime(timeToAdvance * (Constants.TIMED_GAME_MODE_LENGTH + 1));
            expect(removeSpy).toBeCalledTimes(1);
            expect(deleteSpy).toBeCalledTimes(1);
        });
    });

    describe('stopTimer', () => {
        it('should delete the key map', () => {
            const currentTime = 9;
            service['timeMap'].set('socket', currentTime);
            service['timeIntervalMap'].set(
                'socket',
                setInterval(() => {
                    return null;
                }, 0),
            );
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval').mockImplementation();

            service.stopTimer('socket');
            expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
            expect(service['timeMap'].get('socket')).toBeUndefined();
        });
    });

    describe('addTime', () => {
        beforeEach(() => {
            jest.spyOn(gameService, 'getGameState').mockReturnValue({ timedLevelList: [] } as unknown as GameState);
        });

        it('should add time to the timer', () => {
            const currentTime = 4;
            const timeToAdd = 10;
            service['timeMap'].set('socket', currentTime);
            service.addTime(server, 'socket', timeToAdd);
            expect(service['timeMap'].get('socket')).toEqual(currentTime + timeToAdd);
        });

        it('should not add more time than the max time', () => {
            const currentTime = 100;
            const timeToAdd = 100;
            service['timeMap'].set('socket', currentTime);
            service.addTime(server, 'socket', timeToAdd);
            expect(service['timeMap'].get('socket')).toEqual(Constants.TIMED_GAME_MODE_LENGTH);
        });
    });

    describe('subtractTime', () => {
        it('should subtract time to the timer', () => {
            const currentTime = 55;
            const timeToSubtract = 14;
            service['timeMap'].set('socket', currentTime);
            service.subtractTime(server, 'socket', timeToSubtract);
            expect(service['timeMap'].get('socket')).toEqual(currentTime - timeToSubtract);
        });
        it('should not remove more time than the min time', () => {
            const currentTime = 20;
            const timeToSubtract = 100;
            service['timeMap'].set('socket', currentTime);
            service.subtractTime(server, 'socket', timeToSubtract);
            expect(service['timeMap'].get('socket')).toEqual(0);
        });
    });
});

import { GameService, GameState } from '@app/services/game/game.service';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
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
    let otherSocket: SinonStubbedInstance<Socket>;
    let emitSpy: jest.SpyInstance;
    let otherEmitSpy: jest.SpyInstance;
    let mongodbService: SinonStubbedInstance<MongodbService>;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        otherSocket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const socketsMap = new Map<string, Socket>();
        const sockets = { sockets: socketsMap };
        Object.defineProperty(server, 'sockets', { value: sockets });
        jest.spyOn(socketsMap, 'get').mockReturnValue(otherSocket);
        emitSpy = jest.spyOn(socket, 'emit');
        otherEmitSpy = jest.spyOn(otherSocket, 'emit');
        gameService = createStubInstance<GameService>(GameService);
        mongodbService = createStubInstance<MongodbService>(MongodbService);

        Object.defineProperty(socket, 'id', { value: 'socket' });

        jest.spyOn(server, 'to').mockReturnValue(socket as never);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimerService,
                { provide: GameService, useValue: gameService },
                { provide: Socket, useValue: socket },
                { provide: Server, useValue: server },
                { provide: MongodbService, useValue: mongodbService },
            ],
        }).compile();

        service = module.get<TimerService>(TimerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getStartDate', () => {
        it('should correctly return the start date', () => {
            const expectedDate = new Date();
            const expectedTime = 1;
            service['timeMap'] = new Map([['1', { time: expectedTime, startDate: expectedDate }]]);
            const result = service.getStartDate('1');
            expect(result).toEqual(expectedDate);
        });
    });

    describe('getTime', () => {
        it('should return the time of the player', () => {
            const expectedTime = { time: 10, startDate: new Date() };
            service['timeMap'].set('socket', expectedTime);
            expect(service.getTime('socket')).toEqual(expectedTime.time);
        });
    });

    describe('startTimer ', () => {
        let removeSpy: jest.SpyInstance;
        let deleteSpy: jest.SpyInstance;

        beforeEach(() => {
            removeSpy = jest.spyOn(gameService, 'removeLevel').mockImplementation();
            deleteSpy = jest.spyOn(gameService, 'deleteUserFromGame').mockImplementation();
            jest.spyOn(gameService, 'getGameState').mockReturnValue({ levelId: 0, timedGameLength: 120 } as unknown as GameState);
            jest.spyOn(mongodbService, 'addGameHistory').mockImplementation(jest.fn()).mockResolvedValue();
        });

        it('should start the timer for a single player game', () => {
            const expectedTime = 0;
            service.startTimer({ socket }, server, true);
            expect(service['timeMap'].get('socket').time).toEqual(expectedTime);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
        });

        it('should start the timer for a multiplayer game', () => {
            const expectedTime = 120;
            service.startTimer({ socket, otherSocketId: 'secondSocket' }, server, false);
            expect(service['timeMap'].get('socket').time).toEqual(expectedTime);
            expect(service['timeMap'].get('secondSocket').time).toEqual(expectedTime);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
            expect(service['timeIntervalMap'].get('secondSocket')).toBeDefined();
        });

        it('should start the timer for a multiplayer game in classic', () => {
            const expectedTime = 0;
            service.startTimer({ socket, otherSocketId: 'secondSocket' }, server, true);
            expect(service['timeMap'].get('socket').time).toEqual(expectedTime);
            expect(service['timeMap'].get('secondSocket').time).toEqual(expectedTime);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
            expect(service['timeIntervalMap'].get('secondSocket')).toBeDefined();
        });

        it('should emit the time every second', () => {
            const timeToAdvance = 1000;
            service.startTimer({ socket, otherSocketId: 'secondSocket' }, server, true);
            jest.advanceTimersByTime(timeToAdvance);
            expect(otherEmitSpy).toBeCalledTimes(1);
            expect(emitSpy).toBeCalledTimes(1);
        });

        it('should set the time to the the timed game mode time', () => {
            service.startTimer({ socket, otherSocketId: 'secondSocket' }, server, false);
            expect(service['timeMap'].get('socket').time).toEqual(Constants.TIMED_GAME_MODE_LENGTH);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
        });

        it('should decrement the time every second', () => {
            const timeToAdvance = 1000;
            service.startTimer({ socket, otherSocketId: 'secondSocket' }, server, false);
            jest.advanceTimersByTime(timeToAdvance);
            expect(service['timeMap'].get('socket').time).toEqual(Constants.TIMED_GAME_MODE_LENGTH - 1);
        });

        it('should delete user from maps if time is 0', async () => {
            jest.useFakeTimers();
            const spy = jest.spyOn(service, 'stopTimer').mockImplementation();
            const timeToAdvance = 1000;
            service.startTimer({ socket }, server, false);
            jest.advanceTimersByTime(timeToAdvance * (Constants.TIMED_GAME_MODE_LENGTH + 1));
            expect(spy).toBeCalledTimes(1);
        });

        it('should try to remove level at the end of the timer', () => {
            jest.spyOn(gameService, 'getGameState').mockReturnValue({
                levelId: 1,
                foundDifferences: [],
                amountOfDifferencesFound: 0,
                playerName: 'player1',
                isInGame: true,
                isGameFound: false,
                isInCheatMode: false,
                otherSocketId: 'player2',
                timedLevelList: [],
                hintsUsed: 0,
            } as GameState);
            jest.spyOn(service, 'stopTimer').mockImplementation();
            const timeToAdvance = 1000;
            service.startTimer({ socket }, server, false);
            jest.advanceTimersByTime(timeToAdvance * (Constants.TIMED_GAME_MODE_LENGTH + 1));
            expect(removeSpy).toBeCalledTimes(1);
            expect(deleteSpy).toBeCalledTimes(1);
        });

        it('should set the other players time to the correct value', () => {
            const timeToAdvance = 1000;
            service.startTimer({ socket, otherSocketId: 'secondSocket' }, server, false);
            jest.advanceTimersByTime(timeToAdvance);
            expect(service['timeMap'].get('secondSocket').time).toEqual(Constants.TIMED_GAME_MODE_LENGTH - 1);
        });
    });

    describe('stopTimer', () => {
        it('should not do anything if no interval is found', () => {
            jest.spyOn(gameService, 'getGameState').mockReturnValue({ otherSocketId: 'secondSocket' } as unknown as GameState);
            jest.spyOn(service['timeIntervalMap'], 'get').mockReturnValue(undefined);
            jest.spyOn(gameService, 'getGameState').mockReturnValue(undefined);
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval').mockImplementation();
            service.stopTimer('socket');
            expect(clearIntervalSpy).toHaveBeenCalledTimes(0);
        });

        it('should delete the key map', () => {
            const currentTime = { time: 9, startDate: new Date() };
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

        it('should clear other sockets interval', () => {
            const currentTime = { time: 9, startDate: new Date() };
            service['timeMap'].set('secondSocket', currentTime);
            service['timeIntervalMap'].set(
                'secondSocket',
                setInterval(() => {
                    return null;
                }, 0),
            );
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval').mockImplementation();
            jest.spyOn(gameService, 'getGameState').mockReturnValue({ otherSocketId: 'secondSocket' } as unknown as GameState);
            service.stopTimer('socket');
            expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
            expect(service['timeMap'].get('secondSocket')).toBeUndefined();
        });
    });

    describe('addTime', () => {
        beforeEach(() => {
            jest.spyOn(gameService, 'getGameState').mockReturnValue({ timedLevelList: [] } as unknown as GameState);
        });

        it('should add time to the timer', () => {
            const currentTime = { time: 4, startDate: new Date() };
            const timeToAdd = 10;
            service['timeMap'].set('socket', currentTime);
            service.addTime(server, 'socket', timeToAdd);
            expect(service['timeMap'].get('socket').time).toEqual(currentTime.time + timeToAdd);
        });

        it('should not add more time than the max time', () => {
            const currentTime = { time: 100, startDate: new Date() };
            const timeToAdd = 100;
            service['timeMap'].set('socket', currentTime);
            service.addTime(server, 'socket', timeToAdd);
            expect(service['timeMap'].get('socket').time).toEqual(Constants.TIMED_GAME_MODE_LENGTH);
        });

        it('should not remove time if the time is less than 0', () => {
            const currentTime = { time: 0, startDate: new Date() };
            const timeToAdd = -1;
            service['timeMap'].set('socket', currentTime);
            service.addTime(server, 'socket', timeToAdd);
            expect(service['timeMap'].get('socket').time).toEqual(0);
        });

        it('should set the other players time to the correct value', () => {
            const currentTime = { time: 4, startDate: new Date() };
            const timeToAdd = 10;
            service['timeMap'].set('socket', currentTime);
            jest.spyOn(gameService, 'getGameState').mockReturnValue({ otherSocketId: 'secondSocket' } as unknown as GameState);
            service.addTime(server, 'socket', timeToAdd);
            expect(service['timeMap'].get('secondSocket').time).toEqual(currentTime.time + timeToAdd);
        });
    });

    describe('getCurrentTime', () => {
        it('should return curent time', () => {
            const currentTime = { time: 55, startDate: new Date() };
            service['timeMap'].set('socket', currentTime);
            service.getCurrentTime('socket');
            expect(service['timeMap'].get('socket')).toEqual(currentTime);
        });
        it('should return 0 if no current time', () => {
            expect(service.getCurrentTime('socket')).toEqual(0);
        });
    });
});

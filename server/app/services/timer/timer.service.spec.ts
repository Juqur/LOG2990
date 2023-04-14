import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { TimerService } from './timer.service';

jest.useFakeTimers();

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimerService],
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

    describe('startTimer ', () => {
        let server: Server;

        beforeEach(() => {
            server = {
                to: jest.fn(() => ({
                    emit: jest.fn(),
                })),
            } as unknown as Server;
        });

        it('should start the timer for a single player game', () => {
            const expectedTime = 0;
            service.startTimer('socket', server, true);
            expect(service['timeMap'].get('socket').time).toEqual(expectedTime);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
        });

        it('should start the timer for a multiplayer game', () => {
            const expectedTime = 120;
            service.startTimer('socket', server, false, 'secondSocket');
            expect(service['timeMap'].get('socket').time).toEqual(expectedTime);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
            expect(service['timeIntervalMap'].get('secondSocket')).toBeDefined();
        });

        it('should emit the time every second', async () => {
            const emitSpy = jest.fn();
            const toSpy = jest.spyOn(server, 'to').mockReturnValue({ emit: emitSpy } as never);
            const timeToAdvance = 1000;
            service.startTimer('socket', server, true);
            jest.advanceTimersByTime(timeToAdvance);
            expect(toSpy).toBeCalledTimes(1);
            expect(emitSpy).toBeCalledTimes(1);
        });
    });

    describe('stopTimer', () => {
        it('should delete the key map', () => {
            const currentTime = { time: 9, startDate: new Date() };
            service['timeMap'].set('socket', currentTime);
            service['timeIntervalMap'].set('socket', setInterval(jest.fn(), currentTime.time));
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval').mockImplementation();

            service.stopTimer('socket');
            expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
            expect(service['timeMap'].get('socket')).toBeUndefined();
        });
    });

    describe('addTime', () => {
        it('should add time to the timer', () => {
            const currentTime = { time: 4, startDate: new Date() };
            const timeToAdd = 10;
            service['timeMap'].set('socket', currentTime);
            service.addTime('socket', timeToAdd);
            expect(service['timeMap'].get('socket').time).toEqual(currentTime.time + timeToAdd);
        });
    });

    describe('subtractTime', () => {
        it('should subtract time to the timer', () => {
            const currentTime = { time: 55, startDate: new Date() };
            const timeToSubtract = 14;
            service['timeMap'].set('socket', currentTime);
            service.subtractTime('socket', timeToSubtract);
            expect(service['timeMap'].get('socket').time).toEqual(currentTime.time - timeToSubtract);
        });
    });
});

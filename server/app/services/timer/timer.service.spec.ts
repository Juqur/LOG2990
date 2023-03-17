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

            expect(service['timeMap'].get('socket')).toEqual(expectedTime + 1);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
        });

        it('should start the timer for a multiplayer game', () => {
            const expectedTime = 120;
            service.startTimer('socket', server, false, 'secondSocket');

            expect(service['timeMap'].get('socket')).toEqual(expectedTime - 1);
            expect(service['timeIntervalMap'].get('socket')).toBeDefined();
            expect(service['timeIntervalMap'].get('secondSocket')).toBeDefined();
        });
    });

    describe('stopTimer', () => {
        it('should delete the key map', () => {
            const currentTime = 9;
            service['timeMap'].set('socket', currentTime);
            service['timeIntervalMap'].set('socket', setInterval(jest.fn(), currentTime));
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval').mockImplementation();

            service.stopTimer('socket');
            expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
            expect(service['timeMap'].get('socket')).toBeUndefined();
        });
    });

    describe('addTime', () => {
        it('should add time to the timer', () => {
            const currentTime = 4;
            const timeToAdd = 10;
            service['timeMap'].set('socket', currentTime);
            service.addTime('socket', timeToAdd);
            expect(service['timeMap'].get('socket')).toEqual(currentTime + timeToAdd);
        });
    });

    describe('subtractTime', () => {
        it('should subtract time to the timer', () => {
            const currentTime = 55;
            const timeToSubtract = 14;
            service['timeMap'].set('socket', currentTime);
            service.subtractTime('socket', timeToSubtract);
            expect(service['timeMap'].get('socket')).toEqual(currentTime - timeToSubtract);
        });
    });
});

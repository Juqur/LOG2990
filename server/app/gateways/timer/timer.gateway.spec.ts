import { Test, TestingModule } from '@nestjs/testing';
import { TimerGateway } from './timer.gateway';
import { DELAY_BEFORE_EMITTING_TIME } from './timer.gateway.constants';

jest.useFakeTimers();

describe('TimerGateway', () => {
    let gateway: TimerGateway;
    let server;
    let socket;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimerGateway],
        }).compile();

        gateway = module.get<TimerGateway>(TimerGateway);
        server = {
            emit: jest.fn(),
        };
        socket = {
            id: 'id',
            emit: jest.fn(),
        };
        gateway.server = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should add the client to the time map when connects', () => {
        gateway.message(socket);
        expect(gateway.timeMap.has('id')).toBeTruthy();
    });
    it('should set the timer to when the client connects', () => {
        gateway.message(socket);
        expect(gateway.timeMap.get('id')).toEqual(0);
    });

    it('should run setInterval when the client connects', () => {
        const setIntervalSpy = jest.spyOn(global, 'setInterval');
        gateway.message(socket);
        expect(setIntervalSpy).toHaveBeenCalled();
    });

    it('should emit a timer event with the current time', () => {
        const emitSpy = jest.spyOn(socket, 'emit');
        gateway.message(socket);
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(emitSpy).toHaveBeenCalledWith('timer', 1);

        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(emitSpy).toHaveBeenCalledWith('timer', 2);
    });
    it('should remove the client from the time map when disconnects', () => {
        gateway.message(socket);
        gateway.handleDisconnect(socket);
        expect(gateway.timeMap.has('id')).toBeFalsy();
    });
    it('should remove the client from the interval map when disconnects', () => {
        gateway.message(socket);
        gateway.handleDisconnect(socket);
        expect(gateway.intervalMap.has('id')).toBeFalsy();
    });
});

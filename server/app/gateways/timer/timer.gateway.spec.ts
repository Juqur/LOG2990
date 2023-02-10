import { Logger } from '@nestjs/common/services/logger.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { TimerGateway } from './timer.gateway';
import { TimerEvents } from './timer.gateway.events';

describe('TimerGateway', () => {
    let gateway: TimerGateway;
    let server: Server;
    let socket: Socket;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimerGateway, Logger],
        }).compile();

        gateway = module.get<TimerGateway>(TimerGateway);
        server = {
            on: jest.fn(),
            emit: jest.fn(),
        } as unknown as Server;
        gateway.server = server;

        socket = {
            id: 'socket-id',
            emit: jest.fn(),
            on: jest.fn(),
        } as unknown as Socket;
    });

    it('should set the initial time in the timeMap', () => {
        gateway.message(socket, TimerEvents.SoloClassic);
        expect(gateway.timeMap.get('socket-id')).toBe(0);
    });

    it('should start an interval and update the time in the timeMap', () => {
        jest.useFakeTimers();
        gateway.message(socket, TimerEvents.SoloClassic);
        jest.runOnlyPendingTimers();
        expect(gateway.timeMap.get('socket-id')).toBe(1);
    });

    it('should emit the timer event with the updated time', () => {
        jest.useFakeTimers();
        gateway.message(socket, TimerEvents.SoloClassic);
        jest.runOnlyPendingTimers();
        expect(socket.emit).toHaveBeenCalledWith('timer', 1);
    });

    it('should clear the interval for the given socket', () => {
        const clearIntervalSpy = jest.fn();
        jest.spyOn(global, 'clearInterval').mockImplementation(clearIntervalSpy);
        gateway.message(socket, TimerEvents.SoloClassic);
        gateway.handleDisconnect(socket);

        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should delete the time and interval from the maps', () => {
        jest.useFakeTimers();
        gateway.message(socket, TimerEvents.SoloClassic);
        gateway.handleDisconnect(socket);
        expect(gateway.timeMap.has('socket-id')).toBe(false);
    });
});

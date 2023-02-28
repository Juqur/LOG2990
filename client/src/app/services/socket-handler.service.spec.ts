import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';
import { SocketHandler } from './socket-handler.service';

describe('SocketClientService', () => {
    let service: SocketHandler;
    let socketTest: Socket;
    const socketGateway1 = 'socket1';
    const socketGateway2 = 'socket2';

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketHandler);

        service.sockets.set(socketGateway1, new SocketTestHelper() as unknown as Socket);
        service.sockets.set(socketGateway2, new SocketTestHelper() as unknown as Socket);
        socketTest = service.sockets.get(socketGateway1) as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getSocket should return the socket of the given gateway', () => {
        const socket = service.getSocket(socketGateway1);
        expect(socket).toBeDefined();
        expect(socket?.valueOf()).toEqual(jasmine.any(SocketTestHelper));
    });

    it('isSocketAlive should return true if the socket is still connected', () => {
        socketTest.connected = true;
        const isAlive = service.isSocketAlive(socketGateway1);
        expect(isAlive).toBeTruthy();
    });

    it('isSocketAlive should return false if the socket is no longer connected', () => {
        socketTest.connected = false;
        const isAlive = service.isSocketAlive(socketGateway1);
        expect(isAlive).toBeFalsy();
    });

    it('isSocketAlive should return false if the socket is not defined', () => {
        const spy = spyOn(service, 'getSocket').and.returnValue(undefined);
        const isAlive = service.isSocketAlive(socketGateway1);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(isAlive).toBeFalsy();
    });

    it('connect should connect to the given gateway', () => {
        const spy = spyOn(service, 'connect').and.callFake(() => {
            socketTest.connected = true;
        });

        service.connect(socketGateway1);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(service.sockets.get(socketGateway1)).toBeDefined();
        expect(service.sockets.get(socketGateway1)?.connected).toBeTruthy();
    });

    it('should disconnect', () => {
        const spy = spyOn(socketTest, 'disconnect');
        service.disconnect(socketGateway1);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not disconnect if socket is undefined', () => {
        const spyDisconnect = spyOn(socketTest, 'disconnect');
        spyOn(service, 'getSocket').and.returnValue(undefined);
        service.disconnect(socketGateway1);
        expect(spyDisconnect).not.toHaveBeenCalled();
    });

    it('should disconnect all', () => {
        const spy = spyOn(SocketTestHelper.prototype, 'disconnect');
        service.disconnectAll();
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('on should call socket.on with an event', () => {
        const event = 'placeholder';
        const action = jasmine.createSpy('action');
        const spy = spyOn(socketTest, 'on');
        service.on(socketGateway1, event, action);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, action);
    });

    it('send should call emit with data when using send', () => {
        const event = 'placeholder';
        const data = 0;
        const spy = spyOn(socketTest, 'emit');
        service.send(socketGateway1, event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, data);
    });

    it('send should call emit without data when using send if data is undefined', () => {
        const event = 'placeholder';
        const data = undefined;
        const spy = spyOn(socketTest, 'emit');
        service.send(socketGateway1, event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event);
    });
});

import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { io, Socket } from 'socket.io-client';
import { Gateways, SocketHandler } from './socket-handler.service';

describe('SocketClientService', () => {
    let service: SocketHandler;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketHandler);
        service.socketTimer = new SocketTestHelper() as unknown as Socket;
        service.socketChat = new SocketTestHelper() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getSocket should return the socket of the given gateway', () => {
        expect(service.getSocket(Gateways.Timer)).toBe(service.socketTimer);
        expect(service.getSocket(Gateways.Chat)).toBe(service.socketChat);
    });

    it('setSocket should set the socket of the given gateway', () => {
        // Socket of the Karma's localhost.
        const socket = io(window.location.host);
        service.setSocket(Gateways.Timer, socket);
        service.setSocket(Gateways.Chat, socket);
        expect(service.socketTimer).toBe(socket);
        expect(service.socketChat).toBe(socket);
    });

    it('isSocketAlive should return true if the socket is still connected', () => {
        service.socketTimer.connected = true;
        const isAlive = service.isSocketAlive(Gateways.Timer);
        expect(isAlive).toBeTruthy();
    });

    it('isSocketAlive should return false if the socket is no longer connected', () => {
        service.socketTimer.connected = false;
        const isAlive = service.isSocketAlive(Gateways.Timer);
        expect(isAlive).toBeFalsy();
    });

    it('isSocketAlive should return false if the socket is not defined', () => {
        (service.socketTimer as unknown) = undefined;
        const isAlive = service.isSocketAlive(Gateways.Timer);
        expect(isAlive).toBeFalsy();
    });

    it('connect should connect to the given gateway', () => {
        const spy = spyOn(service, 'setSocket').and.callFake(() => {
            service.socketTimer.connected = true;
        });

        service.connect(Gateways.Timer);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(Gateways.Timer, jasmine.any(Socket));
        expect(service.socketTimer).toBeDefined();
        expect(service.socketTimer.connected).toBeTruthy();
    });

    it('should disconnect', () => {
        const spySocketTimer = spyOn(service.socketTimer, 'disconnect');
        service.disconnect(Gateways.Timer);
        expect(spySocketTimer).toHaveBeenCalledTimes(1);
    });

    it('should disconnect all', () => {
        const spySocketTimer = spyOn(service.socketTimer, 'disconnect');
        const spySocketChat = spyOn(service.socketChat, 'disconnect');
        service.disconnectAll();
        expect(spySocketTimer).toHaveBeenCalledTimes(1);
        expect(spySocketChat).toHaveBeenCalledTimes(1);
    });

    it('on should call socket.on with an event', () => {
        const event = 'helloWorld';
        const action = () => {};
        const spy = spyOn(service.socketTimer, 'on');
        service.on(Gateways.Timer, event, action);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, action);
    });

    it('send should call emit with data when using send', () => {
        const event = 'helloWorld';
        const data = 42;
        const spy = spyOn(service.socketTimer, 'emit');
        service.send(Gateways.Timer, event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, data);
    });

    it('send should call emit without data when using send if data is undefined', () => {
        const event = 'helloWorld';
        const data = undefined;
        const spy = spyOn(service.socketTimer, 'emit');
        service.send(Gateways.Timer, event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event);
    });
});

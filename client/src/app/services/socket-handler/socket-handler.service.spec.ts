import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SocketHandler } from './socket-handler.service';

describe('SocketClientService', () => {
    let service: SocketHandler;
    let socketTest: Socket;

    const socketGateway1 = 'socket1';
    const socketGateway2 = 'socket2';
    const mockedSocket = {
        on: () => {
            return;
        },
        emit: () => {
            return;
        },
        disconnect: () => {
            return;
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketHandler);
        service['sockets'].set(socketGateway1, mockedSocket as unknown as Socket);
        service['sockets'].set(socketGateway2, mockedSocket as unknown as Socket);
        socketTest = service['sockets'].get(socketGateway1) as Socket;
        environment.serverUrl = window.location.origin + '/';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getSocket', () => {
        it('should return the socket of the given gateway', () => {
            const socket = service.getSocket(socketGateway1);
            expect(socket).toBeDefined();
        });
    });

    describe('isSocketAlive', () => {
        it('should return true if the socket is still connected', () => {
            socketTest.connected = true;
            const isAlive = service.isSocketAlive(socketGateway1);
            expect(isAlive).toBeTruthy();
        });

        it('should return false if the socket is no longer connected', () => {
            socketTest.connected = false;
            const isAlive = service.isSocketAlive(socketGateway1);
            expect(isAlive).toBeFalsy();
        });

        it('should return false if the socket is not defined', () => {
            const spy = spyOn(service, 'getSocket').and.returnValue(undefined);
            const isAlive = service.isSocketAlive(socketGateway1);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(isAlive).toBeFalsy();
        });
    });

    describe('connect', () => {
        it('should add the socket', () => {
            const setSpy = spyOn(service['sockets'], 'set');
            service.connect(socketGateway1);
            expect(setSpy).toHaveBeenCalledWith(socketGateway1, jasmine.any(Socket));
        });
    });

    describe('disconnect', () => {
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
    });

    describe('disconnectAll', () => {
        it('should disconnect all', () => {
            const spy = spyOn(socketTest, 'disconnect');
            service.disconnectAll();
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('on', () => {
        const event = 'placeholder';

        it('should call on with an event', () => {
            const action = jasmine.createSpy('action');
            const spy = spyOn(socketTest, 'on');
            service.on(socketGateway1, event, action);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(event, action);
        });

        it('should not call on if the socket is undefined', () => {
            const action = jasmine.createSpy('action');
            const spy = spyOn(socketTest, 'on');
            spyOn(service, 'getSocket').and.returnValue(undefined);
            service.on(socketGateway1, event, action);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('removeListener', () => {
        it('should remove listener if listener exists', () => {
            spyOn(service['socketListenersList'], 'indexOf').and.returnValue(0);
            spyOn(service, 'getSocket').and.returnValue(socketTest);
            const spySplice = spyOn(service['socketListenersList'], 'splice');
            socketTest.off = jasmine.createSpy('off');
            service.removeListener('game', 'placeholder');
            expect(spySplice).toHaveBeenCalledTimes(1);
            expect(socketTest.off).toHaveBeenCalledTimes(1);
        });

        it('should do nothing if listener does not exists', () => {
            const index = -1;
            spyOn(service['socketListenersList'], 'indexOf').and.returnValue(index);
            spyOn(service, 'getSocket').and.returnValue(socketTest);
            const spySplice = spyOn(service['socketListenersList'], 'splice');
            socketTest.off = jasmine.createSpy('off');
            service.removeListener('game', 'placeholder');
            expect(spySplice).not.toHaveBeenCalled();
            expect(socketTest.off).not.toHaveBeenCalled();
        });

        it('should do nothing if socket is undefined', () => {
            spyOn(service['socketListenersList'], 'indexOf').and.returnValue(0);
            spyOn(service, 'getSocket').and.returnValue(undefined);
            const spySplice = spyOn(service['socketListenersList'], 'splice');
            socketTest.off = jasmine.createSpy('off');
            service.removeListener('game', 'placeholder');
            expect(spySplice).toHaveBeenCalledTimes(1);
            expect(socketTest.off).not.toHaveBeenCalled();
        });
    });

    describe('send', () => {
        const event = 'placeholder';

        it('should call emit without data when using send if data is undefined', () => {
            const data = undefined;
            const spy = spyOn(socketTest, 'emit');
            service.send(socketGateway1, event, data);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(event);
        });

        it('should not call emit if socket is undefined', () => {
            const data = '0';
            const spy = spyOn(socketTest, 'emit');
            spyOn(service, 'getSocket').and.returnValue(undefined);

            service.send(socketGateway1, event);
            service.send(socketGateway1, event, data);
            expect(spy).not.toHaveBeenCalled();
        });

        it('send should call emit with data when using send', () => {
            const data = '0';
            const spy = spyOn(socketTest, 'emit');
            service.send(socketGateway1, event, data);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(event, data);
        });
    });
});

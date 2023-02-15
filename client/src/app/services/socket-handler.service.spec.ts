import { TestBed } from '@angular/core/testing';
import { io } from 'socket.io-client';

import { Gateways, SocketHandler } from './socket-handler.service';

fdescribe('SocketClientService', () => {
    let service: SocketHandler;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketHandler);

        service['serverUrl'] = window.location.origin + '/';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be able to connect to the server', (done) => {
        const socket = io('http://localhost:9876');
        socket.on('connect', () => {
            expect(socket).toBeTruthy();
            expect(socket.connected).toBeTruthy();
            done();
        });
    });

    it('sockets should be able to connect to the server', (done) => {
        service.connect(Gateways.Timer);
        service.socketTimer.on('connect', () => {
            expect(service.socketTimer).toBeTruthy();
            expect(service.socketTimer.connected).toBeTruthy();
            done();
        });
    });
});

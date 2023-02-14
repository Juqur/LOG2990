import { TestBed } from '@angular/core/testing';
import { io } from 'socket.io-client';

import { SocketHandler } from './socket-handler.service';

fdescribe('SocketClientService', () => {
    const mockServer = new SocketIOMockServer();

    let service: SocketHandler;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketHandler);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be able to connect to the server', () => {


        service.socketTimer = io('http://localhost:3000/timer');
});

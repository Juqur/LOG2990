import { TestBed } from '@angular/core/testing';

import { SocketHandler } from './socket-handler.service';

describe('SocketClientService', () => {
    let service: SocketHandler;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketHandler);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

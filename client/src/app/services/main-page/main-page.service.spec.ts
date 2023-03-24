import { TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { MainPageService } from './main-page.service';

describe('MainPageService', () => {
    let service: MainPageService;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    let routerSpy: jasmine.SpyObj<Router>;
    let popUpServiceSpy: jasmine.SpyObj<PopUpService>;

    beforeEach(() => {
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['isSocketAlive', 'connect']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openPopUp']);
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: Router, useValue: routerSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
            ],
        });
        service = TestBed.inject(MainPageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

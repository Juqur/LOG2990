import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { of } from 'rxjs';
import { MainPageService } from './main-page.service';

describe('MainPageService', () => {
    let service: MainPageService;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    let routerSpy: jasmine.SpyObj<Router>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let popUpServiceSpy: any;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<unknown>>;

    beforeEach(() => {
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['isSocketAlive', 'connect', 'send']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        popUpServiceSpy = {
            openDialog: jasmine.createSpy('openDialog').and.returnValue(of(undefined)),
            dialogRef: dialogRefSpy,
        };
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
            ],
        });
        service = TestBed.inject(MainPageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('navigateTo', () => {
        it('should navigate to the correct route', () => {
            service.navigateTo('test');
            expect(routerSpy.navigate).toHaveBeenCalledWith(['test']);
        });
    });

    describe('chooseName', () => {
        it('should open a pop up', () => {
            service.chooseName();
            expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        });
    });
});

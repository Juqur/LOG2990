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
        let chooseGameTypeSpy: jasmine.Spy;

        beforeEach(() => {
            chooseGameTypeSpy = spyOn(service, 'chooseGameType' as never);
        });

        it('should open a pop up', () => {
            service.chooseName();
            expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        });

        it('should call chooseGameType if the player entered a name', () => {
            const expected = 'name';
            dialogRefSpy.afterClosed.and.returnValue(of(expected));
            service.chooseName();
            expect(chooseGameTypeSpy).toHaveBeenCalledWith(expected);
        });
    });

    describe('connectToSocket', () => {
        it('should connect to the socket if it is not connected', () => {
            socketHandlerSpy.isSocketAlive.and.returnValue(false);
            service.connectToSocket();
            expect(socketHandlerSpy.connect).toHaveBeenCalledWith('game');
        });

        it('should not connect to the socket if it is already connected', () => {
            socketHandlerSpy.isSocketAlive.and.returnValue(true);
            service.connectToSocket();
            expect(socketHandlerSpy.connect).not.toHaveBeenCalled();
        });
    });

    describe('chooseGameType', () => {
        it('should open a pop up', () => {
            service['chooseGameType']('test');
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
        });

        it('should emit a socket event to the sever with false if the player does not want to play with another player', () => {
            const name = 'test';
            dialogRefSpy.afterClosed.and.returnValue(of(false));
            service['chooseGameType'](name);
            expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'createTimedGame', { multiplayer: false, playerName: name });
        });

        it('should emit a socket event to the sever with true if the player wants to play with another player', () => {
            const name = 'test';
            dialogRefSpy.afterClosed.and.returnValue(of(true));
            service['chooseGameType'](name);
            expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'createTimedGame', { multiplayer: true, playerName: name });
        });
    });
});

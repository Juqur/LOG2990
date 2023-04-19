import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication/communication.service';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Level } from '@common/interfaces/level';
import { of } from 'rxjs';
import { MainPageService, TimedGameData } from './main-page.service';

describe('MainPageService', () => {
    let service: MainPageService;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    let routerSpy: jasmine.SpyObj<Router>;
    let popUpServiceSpy: jasmine.SpyObj<PopUpService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<unknown>>;
    const communicationServiceSpy: jasmine.SpyObj<CommunicationService> = jasmine.createSpyObj('CommunicationService', ['getLevels']);

    beforeEach(() => {
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['isSocketAlive', 'connect', 'send', 'on', 'send']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
        popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openDialog'], { dialogRef: dialogRefSpy });

        communicationServiceSpy.getLevels.and.returnValue(of([{} as Level] as Level[]));

        dialogRefSpy.afterClosed.and.returnValue(of({ hasAccepted: true }));
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
            ],
            imports: [HttpClientModule],
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

        it('should set the amount of levels after the levels are refreshed', () => {
            const spy = spyOn(service, 'setAmountOfLevels' as never);
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'refreshLevels') {
                    callback({} as never);
                }
            });
            service.connectToSocket();
            expect(spy).toHaveBeenCalled();
        });

        it('should set the amount of levels after a level is deleted', () => {
            const spy = spyOn(service, 'setAmountOfLevels' as never);
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'deleteLevel') {
                    callback({} as never);
                }
            });
            service.connectToSocket();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('chooseGameType', () => {
        beforeEach(() => {
            spyOn(service, 'waitingForOpponent' as never);
        });
        it('should open a pop up', () => {
            service['chooseGameType']('test');
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
        });

        it('should emit a socket event to the sever with false if the player does not want to play with another player', () => {
            const name = 'test';
            dialogRefSpy.afterClosed.and.returnValue(of(false));
            service['chooseGameType'](name);
            expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onCreateTimedGame', { multiplayer: false, playerName: name });
        });

        it('should emit a socket event to the sever with true if the player wants to play with another player', () => {
            const name = 'test';
            dialogRefSpy.afterClosed.and.returnValue(of(true));
            service['chooseGameType'](name);
            expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onCreateTimedGame', { multiplayer: true, playerName: name });
        });
    });

    describe('waitingForOpponent', () => {
        it('should open a pop up', () => {
            service['waitingForOpponent']('');
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
        });

        it('should emit to server if player cancels while waiting for another player', () => {
            dialogRefSpy.afterClosed.and.returnValue(of(false));
            service['waitingForPlayer'] = true;
            service['waitingForOpponent']('test');
            expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onTimedGameCancelled');
        });

        it('should navigate to the game page with correct params if another player joins', () => {
            const data: TimedGameData = {
                levelId: 1,
                otherPlayerName: 'bob',
            };
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'startTimedGameMultiplayer') {
                    callback(data as never);
                }
            });
            service['waitingForOpponent']('alice');
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/1/'], {
                queryParams: { playerName: 'alice', opponent: 'bob', gameMode: 'timed' },
            });
        });
    });

    // describe('setAmountOfLevels', () => {
    //     it('should set amountOfLevels to the length of the levels returned by communication service', () => {
    //         // const levels = [{} as Level];
    //         // communicationServiceSpy.getLevels.and.returnValue(of(levels));
    //         service.setAmountOfLevels();
    //         expect(service.amountOfLevels).toEqual(1);
    //     });
    // });
});

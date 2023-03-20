import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Level } from '@app/levels';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { LevelService } from '@app/services/levelService/level.service';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socketHandlerService/socket-handler.service';
import { of } from 'rxjs';
import { SelectionData, SelectionPageService, StartGameData } from './selection-page.service';

describe('SelectionPageService', () => {
    let service: SelectionPageService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let popUpServiceSpy: any;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    let levelServiceSpy: jasmine.SpyObj<LevelService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<unknown>>;
    let routerSpy: jasmine.SpyObj<Router>;

    const levels: Level[] = [
        {
            id: 1,
            name: 'Level 1',
            playerSolo: [],
            timeSolo: [],
            playerMulti: [],
            timeMulti: [],
            isEasy: true,
            nbDifferences: 1,
            canJoin: false,
        },
    ];

    beforeEach(() => {
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['on', 'isSocketAlive', 'send', 'connect', 'removeListener']);
        levelServiceSpy = jasmine.createSpyObj('LevelService', ['removeCard'], { allLevels: levels });
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));

        popUpServiceSpy = {
            openDialog: jasmine.createSpy('openDialog').and.returnValue(of(undefined)),
            dialogRef: dialogRefSpy,
        };

        TestBed.configureTestingModule({
            imports: [AppRoutingModule, AppMaterialModule],
            providers: [
                { provide: LevelService, useValue: levelServiceSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(SelectionPageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call updateSelection when server sends updateSelection event', () => {
        const selectionData: SelectionData = {
            levelId: 1,
            canJoin: true,
        };
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'updateSelection') {
                callback(selectionData as never);
            }
        });
        const updateSelectionSpy = spyOn(service, 'updateSelection' as never);
        service.setupSocket(levelServiceSpy);
        expect(updateSelectionSpy).toHaveBeenCalledWith(selectionData as never, levelServiceSpy as never);
    });

    it('should call openInvalidNameDialog when server sends invalidName event', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'invalidName') {
                callback({} as never);
            }
        });
        const openInvalidNameDialogSpy = spyOn(service, 'openInvalidNameDialog' as never);
        service.setupSocket(levelServiceSpy);
        expect(openInvalidNameDialogSpy).toHaveBeenCalled();
    });

    it('should call openToBeAcceptedDialog when server sends toBeAccepted event', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'toBeAccepted') {
                callback({} as never);
            }
        });
        const openToBeAcceptedDialogSpy = spyOn(service, 'openToBeAcceptedDialog' as never);
        service.setupSocket(levelServiceSpy);
        expect(openToBeAcceptedDialogSpy).toHaveBeenCalled();
    });

    it('should call openPlayerSelectionDialog when server playerSelection event', () => {
        const name = 'Alice';
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'playerSelection') {
                callback(name as never);
            }
        });
        const openPlayerSelectionDialogSpy = spyOn(service, 'openPlayerSelectionDialog' as never);
        service.setupSocket(levelServiceSpy);
        expect(openPlayerSelectionDialogSpy).toHaveBeenCalledWith(name as never);
    });

    it('should call closeDialogOnDeletedLevel when server shutDownGame event', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'shutDownGame') {
                callback({} as never);
            }
        });
        const closeDialogOnDeletedLevelSpy = spyOn(service, 'closeDialogOnDeletedLevel' as never);
        service.setupSocket(levelServiceSpy);
        expect(closeDialogOnDeletedLevelSpy).toHaveBeenCalled();
    });

    it('should call startMultiplayerGame when server startClassicMultiplayerGame event', () => {
        const name = 'Alice';
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'startClassicMultiplayerGame') {
                callback(name as never);
            }
        });
        const startMultiplayerGameSpy = spyOn(service, 'startMultiplayerGame' as never);
        service.setupSocket(levelServiceSpy);
        expect(startMultiplayerGameSpy).toHaveBeenCalledWith(name as never);
    });

    it('should close the dialog when server rejectedGame event', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'rejectedGame') {
                callback({} as never);
            }
        });
        service.setupSocket(levelServiceSpy);
        expect(popUpServiceSpy.dialogRef.close).toHaveBeenCalled();
    });

    it('should call startMultiplayerGame when server deleteLevel event', () => {
        const gameId = 1;
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'deleteLevel') {
                callback(gameId as never);
            }
        });
        service.setupSocket(levelServiceSpy);
        expect(levelServiceSpy.removeCard).toHaveBeenCalled();
    });

    it('should open a dialog when a player creates a game and when the player closes the dialog', () => {
        const waitForMatchSpy = spyOn(service, 'waitForMatch' as never);
        service.startGameDialog(1);
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        expect(waitForMatchSpy).toHaveBeenCalled();
    });

    it('should emit a socket event when the user waits for a player and when player closes the dialog', () => {
        const id = 1;
        const name = 'Alice';
        service['waitForMatch'](id, name);
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onGameSelection', { levelId: id, playerName: name });
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onCancelledWhileWaiting', {});
    });

    it('should update levels correctly by updating the canJoin attribute', () => {
        const data: SelectionData = {
            levelId: 1,
            canJoin: true,
        };
        service['updateSelection'](data, levelServiceSpy);
        expect(levelServiceSpy.allLevels[0].canJoin).toBeTrue();
    });

    it('should return false from the dialog in name is invalid', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        service['startGameDialog'](1);
        const value = service['dialog'].inputData?.submitFunction('');
        expect(value).toBeFalse();
    });

    it('should return true from the dialog in name is valid', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        service['startGameDialog'](1);
        const value = service['dialog'].inputData?.submitFunction('Bob');
        expect(value).toBeTruthy();
    });

    it('should open a dialog when the player enters an invalid name', () => {
        service['openInvalidNameDialog']();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
    });

    it('should let the player know that another user has to accept the invitation', () => {
        service['openToBeAcceptedDialog']();
        expect(popUpServiceSpy.dialogRef.close).toHaveBeenCalled();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
    });

    it('should let the player cancel the invitation', () => {
        service['openToBeAcceptedDialog']();
        expect(popUpServiceSpy.dialogRef.close).toHaveBeenCalled();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onGameRejected', {});
    });

    it('should emit a socket event when the player accepts the invitation', () => {
        service['openPlayerSelectionDialog']('');
        expect(popUpServiceSpy.dialogRef.close).toHaveBeenCalled();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onGameAccepted', {});
    });

    it('should emit a socket event when the player rejects the invitation', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        service['openPlayerSelectionDialog']('');
        expect(popUpServiceSpy.dialogRef.close).toHaveBeenCalled();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onGameRejected', {});
    });

    it('should navigate to the game page when the player accepts the invitation', () => {
        const gameData: StartGameData = {
            levelId: 1,
            playerName: 'Alice',
            secondPlayerName: 'Bob',
        };
        service['startMultiplayerGame'](gameData);
        expect(popUpServiceSpy.dialogRef.close).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith([`/game/${gameData.levelId}/`], {
            queryParams: { playerName: gameData.playerName, opponent: gameData.secondPlayerName },
        });
    });

    it('should open a dialog when the level gets deleted while waiting for a player', () => {
        service['closeDialogOnDeletedLevel']();
        expect(popUpServiceSpy.dialogRef.close).toHaveBeenCalled();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
    });
});

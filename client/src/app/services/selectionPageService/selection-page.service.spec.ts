import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { Level } from '@app/levels';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { LevelService } from '@app/services/levelService/level.service';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { of } from 'rxjs';
import { SelectionData, SelectionPageService } from './selection-page.service';

describe('SelectionPageService', () => {
    let service: SelectionPageService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let popUpServiceSpy: any;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    let levelServiceSpy: jasmine.SpyObj<LevelService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<unknown>>;

    beforeEach(() => {
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['on', 'isSocketAlive', 'send', 'connect', 'removeListener']);
        levelServiceSpy = jasmine.createSpyObj('LevelService', ['']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
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
            ],
        });
        service = TestBed.inject(SelectionPageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onGameCancelledWhileWaitingForSecondPlayer', {});
    });

    it('should update levels correctly by updating the canJoin attribute', () => {
        const data: SelectionData = {
            levelId: 1,
            canJoin: true,
        };
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
        spyOnProperty(levelServiceSpy, 'shownLevels' as never).and.returnValue(levels);
        service['updateSelection'](data, levelServiceSpy);
    });

    it('should open a dialog when the player enters an invalid name', () => {
        service['openInvalidNameDialog']();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
    });
});

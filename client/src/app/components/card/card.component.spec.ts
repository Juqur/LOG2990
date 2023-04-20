import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { of } from 'rxjs';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
    let component: CardComponent;
    let fixture: ComponentFixture<CardComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    const popUpService = jasmine.createSpyObj('PopUpServiceService', ['openDialog', 'dialogRef']);
    popUpService.dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    popUpService.dialogRef.afterClosed.and.returnValue(of({ hasAccepted: true }));

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['send']);

        await TestBed.configureTestingModule({
            declarations: [CardComponent, CarouselComponent],
            imports: [MatDialogModule, RouterTestingModule.withRoutes([{ path: 'example', component: CardComponent }])],
            providers: [
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: PopUpService, useValue: popUpService },
                { provide: Router, useValue: routerSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        fixture.nativeElement.querySelector('img').setAttribute('src', ''); // Prevents an actual request.
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the easy difficulty icon', () => {
        component.level.isEasy = true;
        expect(component.displayDifficultyIcon()).toEqual('assets/images/easy.png');
    });

    it('should display the hard difficulty icon', () => {
        component.level.isEasy = false;
        expect(component.displayDifficultyIcon()).toEqual('assets/images/hard.png');
    });

    it('PlaySolo should ask for playerName', () => {
        popUpService.openDialog.and.returnValue({
            afterClosed: () =>
                of({
                    hasAccepted: true,
                }),
        });
        popUpService.result = 'nom';
        component.level.id = 1;
        component.playSolo();
        expect(popUpService.openDialog).toHaveBeenCalled();
    });

    it('should call emit for startGameDialogEvent', () => {
        const spy = spyOn(component.startGameDialogEvent, 'emit');
        component.playMultiplayer();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('deleteLevel should emit deleteLevelEvent', () => {
        const spy = spyOn(component.deleteLevelEvent, 'emit');
        popUpService.openDialog.and.returnValue({
            afterClosed: () =>
                of({
                    hasAccepted: true,
                }),
        });
        component.level.id = 1;
        component.deleteLevel(1);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('resetLevelHighScore should call resetLevelHighScoreEvent', () => {
        const spy = spyOn(component.resetLevelHighScoreEvent, 'emit');
        component.level.id = 1;
        component.resetLevelHighScore(1);
        expect(spy).toHaveBeenCalledTimes(1);
    });
});

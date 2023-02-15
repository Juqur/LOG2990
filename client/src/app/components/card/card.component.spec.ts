import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { PopUpServiceService } from '@app/services/pop-up-service.service';
import { of } from 'rxjs';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
    let component: CardComponent;
    let fixture: ComponentFixture<CardComponent>;
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const popUpService = jasmine.createSpyObj('PopUpServiceService', ['openDialog', 'dialogRef']);
    popUpService.dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    popUpService.dialogRef.afterClosed.and.returnValue(of({ hasAccepted: true }));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CardComponent, CarouselComponent],
            imports: [MatDialogModule, RouterTestingModule.withRoutes([{ path: 'example', component: CardComponent }])],
            providers: [
                { provide: PopUpServiceService, useValue: popUpService },
                { provide: Router, useValue: routerSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the easy difficulty icon', () => {
        component.level.isEasy = true;
        expect(component.displayDifficultyIcon()).toEqual('../../../assets/images/easy.png');
    });

    it('should display the hard difficulty icon', () => {
        component.level.isEasy = false;
        expect(component.displayDifficultyIcon()).toEqual('../../../assets/images/hard.png');
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
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
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
                { provide: PopUpService, useValue: popUpService },
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

    describe('playMultiplayer', () => {
        it('should call emit for startGameDialogEvent', () => {
            const spy = spyOn(component.startGameDialogEvent, 'emit');
            component.playMultiplayer();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    it('should provide a method to check if the name is valid and should at least invalidate very long names', () => {
        /**
         * What defines a very long name is left to the user of the component and we store in server. This could change as
         * time goes on but it seems appropriate to forbid people from using the entire works of Shakespeare for a name.
         */
        expect(component['saveDialogData'].inputData?.submitFunction).toBeDefined();
        const longName =
            // eslint-disable-next-line max-len
            "My mistress' eyes are nothing like the sun; Coral is far more red than her lips' red; If snow be white, why then her breasts are dun; If hairs be wires, black wires grow on her head. I have seen roses damasked, red and white, But no such roses see I in her cheeks; And in some perfumes is there more delight Than in the breath that from my mistress reeks. I love to hear her speak, yet well I know That music hath a far more pleasing sound; I grant I never saw a goddess go; My mistress when she walks treads on the ground. And yet, by heaven, I think my love as rare As any she belied with false compare.'";
        expect(component['saveDialogData'].inputData?.submitFunction(longName)).toEqual(false);
        const smallName = 'Small name';
        expect(component['saveDialogData'].inputData?.submitFunction(smallName)).toEqual(true);
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
        expect(popUpService.openDialog).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});

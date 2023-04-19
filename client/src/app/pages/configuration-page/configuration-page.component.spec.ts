import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CardComponent } from '@app/components/card/card.component';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { LevelService } from '@app/services/level/level.service';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { of } from 'rxjs';
import { ConfigurationPageComponent } from './configuration-page.component';

describe('ConfigurationPageComponent', () => {
    let component: ConfigurationPageComponent;
    let fixture: ComponentFixture<ConfigurationPageComponent>;
    let popUpServiceSpy: jasmine.SpyObj<PopUpService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<unknown>>;
    let deleteLevelSpy: jasmine.Spy;
    let deleteAllLevelsSpy: jasmine.Spy;

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
        popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openDialog'], { dialogRef: dialogRefSpy });
        dialogRefSpy.afterClosed.and.returnValue(of({ hasAccepted: true }));

        deleteLevelSpy = spyOn(LevelService.prototype, 'deleteLevel');
        deleteAllLevelsSpy = spyOn(LevelService.prototype, 'deleteAllLevels');

        await TestBed.configureTestingModule({
            declarations: [ConfigurationPageComponent, CarouselComponent, CardComponent, ScaleContainerComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule, HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigurationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onDeleteLevel', () => {
        it('should call openDialog', () => {
            component.onDeleteLevel(0);
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
        });

        it('should call deleteLevel', () => {
            component.onDeleteLevel(0);
            expect(deleteLevelSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('onDeleteAllLevels', () => {
        it('should call openDialog', () => {
            component.onDeleteAllLevels();
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
        });

        it('should call deleteLevel', () => {
            component.onDeleteAllLevels();
            expect(deleteAllLevelsSpy).toHaveBeenCalledTimes(1);
        });
    });
});

import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardComponent } from '@app/components/card/card.component';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { Level } from '@app/levels';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { ConfigurationComponent } from './configuration.component';

describe('ConfigurationComponent', () => {
    let component: ConfigurationComponent;
    let fixture: ComponentFixture<ConfigurationComponent>;
    let communicationService: CommunicationService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigurationComponent, CarouselComponent, CardComponent, ScaleContainerComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule],
            providers: [HttpClient, HttpHandler],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigurationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        communicationService = TestBed.inject(CommunicationService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set levels and levelToShow after ngOnInit', () => {
        const levels: Level[] = [
            {
                id: 1,
                name: '',
                playerMulti: [],
                playerSolo: [],
                timeMulti: [],
                timeSolo: [],
                isEasy: false,
            },
        ];
        spyOn(communicationService, 'getLevels').and.returnValue(of(levels));
        component.ngOnInit();
        expect(component.levels).toEqual(levels);
    });

    it('nextPage() should increment the current page', () => {
        const tempPage = component.currentPage;
        component.lastPage = 10;
        component.nextPage();
        expect(component.currentPage).toEqual(tempPage + 1);
    });

    it('previousPage() should decrement the current page', () => {
        component.lastPage = 10;
        component.currentPage = component.lastPage;
        const tempPage = component.currentPage;
        component.previousPage();
        expect(component.currentPage).toEqual(tempPage - 1);
    });

    it('arrow_back button should be disabled if at the first page', () => {
        expect(document.getElementById('arrow_back')).toBeInstanceOf(HTMLButtonElement);
        expect((document.getElementById('arrow_back') as HTMLButtonElement).disabled).toBeTruthy();
    });

    it('arrow_back button should be disabled if at the first page', () => {
        component.currentPage = component.lastPage;
        expect(document.getElementById('arrow_back')).toBeInstanceOf(HTMLButtonElement);
        expect((document.getElementById('arrow_back') as HTMLButtonElement).disabled).toBeTruthy();
    });
});

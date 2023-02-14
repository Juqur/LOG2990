import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardComponent } from '@app/components/card/card.component';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { Level } from '@app/levels';
import { AppMaterialModule } from '@app/modules/material.module';
import { ConfigurationComponent } from './configuration.component';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { Constants } from '@common/constants';

describe('ConfigurationComponent', () => {
    let component: ConfigurationComponent;
    let fixture: ComponentFixture<ConfigurationComponent>;
    let levels: Level[];
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
        communicationService = TestBed.inject(CommunicationService);
        component = fixture.componentInstance;
        fixture.detectChanges();
        const level: Level = {
            id: 1,
            name: '',
            imageOriginal: '',
            imageDiff: '',
            playerMulti: [],
            playerSolo: [],
            timeMulti: [],
            timeSolo: [],
            isEasy: false,
        };
        levels = [level, level, level, level, level, level, level, level];
        component.levels = levels;
        component.currentPage = 0;
        component.lastShownLevel = Constants.levelsPerPage;
        component.levelToShow = component.levels.slice(component.firstShownLevel, component.lastShownLevel);
        component.lastPage = Math.round(component.levels.length / Constants.levelsPerPage - 1);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set levels and levelToShow after ngOnInit', () => {
        spyOn(communicationService, 'getLevels').and.returnValue(of(levels));
        component.ngOnInit();
        expect(component.levels).toEqual(levels);
    });

    it('should set LastPage after ngOnInit', () => {
        spyOn(communicationService, 'getLevels').and.returnValue(of(levels));
        component.ngOnInit();
        expect(component.lastPage).toEqual(1);
    });

    it('should set levels and levelToShow after ngOnInit', () => {
        expect(component.levels).toEqual(levels);
    });

    it('should return true if isBeginningOfList', () => {
        component.currentPage = 0;
        expect(component.isBeginningOfList()).toBeTrue();
    });

    it('should return true if isEndOfList', () => {
        component.currentPage = component.lastPage;
        expect(component.isEndOfList()).toBeTrue();
    });

    it('nextPage() should increment the current page', () => {
        const tempPage = component.currentPage;
        component.nextPage();
        expect(component.currentPage).toEqual(tempPage + 1);
        expect(component.firstShownLevel).toEqual(Constants.levelsPerPage);
        expect(component.lastShownLevel).toEqual(Constants.levelsPerPage * 2);
        expect(component.levelToShow).toEqual([levels[4], levels[5], levels[6], levels[7]]);
    });

    it('previousPage() should decrement the current page', () => {
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

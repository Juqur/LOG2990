import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardComponent } from '@app/components/card/card.component';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { levels } from '@app/levels';
import { AppMaterialModule } from '@app/modules/material.module';
import { Constants } from '@common/constants';
import { ConfigurationComponent } from './configuration.component';

describe('ConfigurationComponent', () => {
    let component: ConfigurationComponent;
    let fixture: ComponentFixture<ConfigurationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigurationComponent, CarouselComponent, CardComponent, ScaleContainerComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigurationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('levels should not be empty', () => {
        expect(component.levels.length).toBeGreaterThan(0);
    });

    it('Should load up to 4 cards', () => {
        const cards = document.getElementsByClassName('card');
        if (levels.length < Constants.levelsPerPage) {
            expect(cards.length).toEqual(levels.length);
        }
        expect(cards.length).toBeLessThanOrEqual(Constants.levelsPerPage);
    });

    it('nextPage() should increment the current page', () => {
        const tempPage = component.currentPage;
        component.nextPage();
        expect(component.currentPage).toEqual(tempPage + 1);
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

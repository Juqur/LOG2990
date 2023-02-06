import { ComponentFixture, TestBed } from '@angular/core/testing';
import { levels } from '@app/levels';
import { Constants } from '@common/constants';
import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // Il devrait toujours exister une partie dans la base de donnée du serveur
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

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

    it('levels should not be empty', () => {
        expect(component.levels.length).toBeGreaterThan(0);
    });

    it('next page should increment the current page', () => {
        const tempPage = component.currentPage;
        component.nextPage();
        expect(component.currentPage).toEqual(tempPage + 1);
    });

    it('previous pages= should increment the current page', () => {
        component.currentPage = component.lastPage;
        const tempPage = component.currentPage;
        component.previousPage();
        expect(component.currentPage).toEqual(tempPage - 1);
    });
});

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';

import { MouseService } from './mouse.service';

describe('MouseService', () => {
    let service: MouseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, AppMaterialModule, RouterTestingModule],
        });
        service = TestBed.inject(MouseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getMousePosition should return the correct position if user is allowed to click', () => {
        const expectedPosition = 2564;
        const mockEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        service['canClick'] = true;
        expect(service.getMousePosition(mockEvent)).toEqual(expectedPosition);
    });

    it('getMousePosition should return null if user is not allowed to click', () => {
        const mockEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        service['canClick'] = false;
        expect(service.getMousePosition(mockEvent)).toBeNull();
    });

    it('changeClickState should change the click state', () => {
        const expectedStartValue = true;
        const expectedEndValue = false;
        expect(service['canClick']).toEqual(expectedStartValue);
        service.changeClickState();
        expect(service['canClick']).toEqual(expectedEndValue);
    });

    it('getCanClick should return the correct value', () => {
        const expectedValue = true;
        expect(service.getCanClick()).toEqual(expectedValue);
    });

    it('getX should return the correct value', () => {
        const expectedValue = 1;
        service['mousePosition'] = { x: expectedValue, y: 1 };
        expect(service.getX()).toEqual(expectedValue);
    });

    it('getY should return the correct value', () => {
        const expectedValue = 1;
        service['mousePosition'] = { x: 1, y: expectedValue };
        expect(service.getY()).toEqual(expectedValue);
    });
});

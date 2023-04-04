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
        service.canClick = true;
        expect(service.getMousePosition(mockEvent)).toEqual(expectedPosition);
    });

    it('getMousePosition should return null if user is not allowed to click', () => {
        const mockEvent = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        service.canClick = false;
        expect(service.getMousePosition(mockEvent)).toBeNull();
    });

    it('getX should return the correct value', () => {
        const expectedValue = 7;
        service['mousePosition'] = { x: expectedValue, y: 1 };
        expect(service.x).toEqual(expectedValue);
    });

    it('getY should return the correct value', () => {
        const expectedValue = 7;
        service['mousePosition'] = { x: 1, y: expectedValue };
        expect(service.y).toEqual(expectedValue);
    });

    it('should update mousePosition when left mouse button is pressed', async () => {
        const mouseEvent = {
            offsetX: 100,
            offsetY: 200,
            button: 0,
        } as MouseEvent;
        await service.mouseDrag(mouseEvent);
        const x = service.x;
        const y = service.y;
        expect(x).toEqual(mouseEvent.offsetX);
        expect(y).toEqual(mouseEvent.offsetY);
    });
});

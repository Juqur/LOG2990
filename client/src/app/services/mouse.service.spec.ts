import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { Constants } from '@common/constants';
// import { of } from 'rxjs';

import { MouseService } from './mouse.service';

describe('MouseService', () => {
    let service: MouseService;
    let mouseEvent: MouseEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, AppMaterialModule, RouterTestingModule],
        });
        service = TestBed.inject(MouseService);
        mouseEvent = {
            offsetX: 100,
            offsetY: 200,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mouseHitDetect should correctly change the mouse position attribute', () => {
        spyOn(service, 'processClick');
        service.mouseHitDetect(mouseEvent);
        expect(service.getX()).toEqual(mouseEvent.offsetX);
        expect(service.getY()).toEqual(mouseEvent.offsetY);
    });

    it('mouseHitDetect should call processClick', () => {
        const spy = spyOn(service, 'processClick');
        service.mouseHitDetect(mouseEvent);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('mouseHitDetect should return false if the event does not support the correct button', () => {
        spyOn(service, 'processClick');
        const result = service.mouseHitDetect(mouseEvent);
        expect(result).not.toBeTrue();
    });

    it('process click should return false if we cannot click', () => {
        spyOn(service, 'getCanClick').and.returnValue(false);
        const result = service.processClick();
        expect(result).not.toBeTrue();
    });

    it('processClick should return a promise if the click is valid.', () => {
        spyOn(service, 'getX').and.returnValue(Constants.testXposition);
        spyOn(service, 'getY').and.returnValue(Constants.testYposition);
        spyOn(service, 'incrementCounter');

        service.processClick().then((value) => {
            expect(value).toBeInstanceOf(Promise);
        });
    });

    it('the difference counter should start at a value of 0', () => {
        const expectedValue = 0;
        expect(service.getDifferenceCounter()).toEqual(expectedValue);
    });

    it('processClick should call incrementCounter', async () => {
        spyOn(service, 'getCanClick').and.returnValue(true);
        spyOn(service, 'getDifferencesArray').and.returnValue(Promise.resolve([1]));
        const spy = spyOn(service, 'incrementCounter');
        await service.processClick();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('incrementCounter should increment the counter by a value of one', () => {
        const expectedStartValue = 0;
        const expectedEndValue = 1;
        expect(service.getDifferenceCounter()).toEqual(expectedStartValue);
        service.incrementCounter();
        expect(service.getDifferenceCounter()).toEqual(expectedEndValue);
    });

    it('changeClickState should change the click state', () => {
        const expectedStartValue = true;
        const expectedEndValue = false;
        expect(service['canClick']).toEqual(expectedStartValue);
        service.changeClickState();
        expect(service['canClick']).toEqual(expectedEndValue);
    });
});

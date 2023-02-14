import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Constants } from '@common/constants';

import { MouseService } from './mouse.service';

describe('MouseService', () => {
    let service: MouseService;
    let mouseEvent: MouseEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
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
        service.mouseHitDetect(mouseEvent, []);
        expect(service.getX()).toEqual(mouseEvent.offsetX);
        expect(service.getY()).toEqual(mouseEvent.offsetY);
    });

    it('mouseHitDetect should call processClick', () => {
        const spy = spyOn(service, 'processClick');
        service.mouseHitDetect(mouseEvent, []);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('mouseHitDetect should return false if the event does not support the correct button', () => {
        spyOn(service, 'processClick');
        const result = service.mouseHitDetect(mouseEvent, []);
        expect(result).not.toBeTrue();
    });

    it('process click should return false if we cannot click', () => {
        spyOn(service, 'getCanClick').and.returnValue(false);
        const result = service.processClick([]);
        expect(result).not.toBeTrue();
    });

    it('processClick should return false it the array is empty', () => {
        /* TODO
         * This test is subject to failure once the server connection has been implemented.
         * Please refactor this test to correctly test that if the server returns an empty array,
         * such that there are no difference where we clicked, that processClick returns false.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'getTestVariable').and.returnValue([]);
        const result = service.processClick([]);
        expect(result).not.toBeTrue();
    });

    it('processClick should call incrementCounter', () => {
        spyOn(service, 'getX').and.returnValue(Constants.fifty);
        spyOn(service, 'getY').and.returnValue(Constants.fifty);
        const spy = spyOn(service, 'incrementCounter');
        service.processClick([1]);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('processClick should return true if the click is valid.', () => {
        spyOn(service, 'getX').and.returnValue(Constants.fifty);
        spyOn(service, 'getY').and.returnValue(Constants.fifty);
        spyOn(service, 'incrementCounter');
        const result = service.processClick([1, 2, 3]);
        expect(result).toBeTrue();
    });

    it('the difference counter should start at a value of 0', () => {
        const expectedValue = 0;
        expect(service.getDifferenceCounter()).toEqual(expectedValue);
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

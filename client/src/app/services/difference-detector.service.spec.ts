import { TestBed } from '@angular/core/testing';

import { DifferenceDetectorService } from './difference-detector.service';

describe('DifferenceDetectorService', () => {
    let service: DifferenceDetectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DifferenceDetectorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return undefined if the radius is 0', () => {
        const canvasContext: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        expect(service.detectDifferences(canvasContext, canvasContext, '0')).toBeUndefined();
    });

    it('should return undefined if the radius is negative', () => {
        const canvasContext: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        expect(service.detectDifferences(canvasContext, canvasContext, '-1')).toBeUndefined();
    });
    it('detectDifferences should call comparePixels', () => {
        const canvasContext: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const spyComparePixel = spyOn(service, 'comparePixels');
        service.detectDifferences(canvasContext, canvasContext, '1');
        expect(spyComparePixel).toHaveBeenCalled();
    });
    it('detectDifferences should call addRadius with the proper width', () => {
        const width = 25;
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        const canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;
        const spyAddRadius = spyOn(service, 'addRadius');
        service.detectDifferences(canvasContext, canvasContext, '1');
        expect(spyAddRadius).toHaveBeenCalledWith(width);
    });
    it('detectDifferences should call chooseDifficulty', () => {
        const canvas: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const spyChooseDifficulty = spyOn(service, 'chooseDifficulty');
        service.detectDifferences(canvas, canvas, '1');
        expect(spyChooseDifficulty).toHaveBeenCalled();
    });
    it('addRadius should return undefined if the radius is 0', () => {
        expect(service.addRadius(0)).toBeUndefined();
    });
    // it('should expect undefined if differentCanvas is undefined', () => {
    //     const canvas: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    //     const spyDetectDifferences = spyOn(service, 'detectDifferences');
    //     spyOn(document, 'createElement').and.returnValue(undefined);
    //     service.detectDifferences(canvas, canvas, '1');
    //     expect(spyDetectDifferences).toBeUndefined();
    // });
    it('addRadius should call changeColor the correct amount of time', () => {
        const spyChangeColor = spyOn(service, 'changeColor');
        service.initialDifferentPixels = [1, 2, 3, 4, 5, 6];
        service.radius = 1;
        service.defaultImageArray = new Uint8ClampedArray(6);
        service.addRadius(2);
        expect(spyChangeColor).toHaveBeenCalledTimes(8);
        expect(service.counter).toEqual(8);
    });

    it('chooseDiffculty should return false if the game is easy', () => {
        service.differences = 0;
        service.defaultImageArray = new Uint8ClampedArray(1);
        service.counter = 1;
        expect(service.chooseDifficulty()).toBeFalsy();
        service.differences = 7 + 1;
        service.defaultImageArray = new Uint8ClampedArray(1);
        service.counter = 1;
        expect(service.chooseDifficulty()).toBeFalsy();
        service.differences = 0;
        service.defaultImageArray = new Uint8ClampedArray(1);
        service.counter = 0;
        expect(service.chooseDifficulty()).toBeFalsy();
    });
    it('chooseDiffculty should return true if the game is hard', () => {
        service.differences = 7 + 1;
        service.defaultImageArray = new Uint8ClampedArray(1);
        service.counter = 0;
        expect(service.chooseDifficulty()).toBeTruthy();
    });
    it('comparePixels should call changeColor the correct amount of time if the pixels are different', () => {
        const spyChangeColor = spyOn(service, 'changeColor');
        service.defaultImageArray = new Uint8ClampedArray(16);
        service.modifiedImageArray = new Uint8ClampedArray(16);
        for (let i = 0; i < 16; i++) {
            service.modifiedImageArray[i] = 1;
            service.defaultImageArray[i] = 0;
        }
        service.comparePixels();
        expect(spyChangeColor).toHaveBeenCalledTimes(4);
    });
});

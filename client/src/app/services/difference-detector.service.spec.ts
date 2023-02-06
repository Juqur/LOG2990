import { TestBed } from '@angular/core/testing';
import { TestConstants } from '@common/test-constants';

import { CHANNELS_PER_PIXEL, DifferenceDetectorService, FULL_ALPHA } from './difference-detector.service';

describe('DifferenceDetectorService', () => {
    let service: DifferenceDetectorService;
    let defaultCanvas: CanvasRenderingContext2D;
    let modifiedCanvas: CanvasRenderingContext2D;
    let defaultImage: HTMLImageElement;
    let modifiedImage: HTMLImageElement;
    let cluster: number[][];

    beforeEach(() => TestBed.configureTestingModule({}));

    beforeEach((done) => {
        service = TestBed.inject(DifferenceDetectorService);
        defaultImage = new Image();
        modifiedImage = new Image();

        // Image must ABSOLUTELY load before the test can be run.
        const loadImage = new Promise<void>((resolve) => {
            defaultImage.src = './assets/test/image_7_diff.bmp';
            modifiedImage.src = './assets/test/image_empty.bmp';
            defaultImage.onload = () => {
                modifiedImage.onload = () => {
                    resolve();
                };
            };
        });

        // Draw images to canvas.
        loadImage.then(() => {
            defaultCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            modifiedCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            defaultCanvas.canvas.width = defaultImage.width;
            defaultCanvas.canvas.height = defaultImage.height;
            modifiedCanvas.canvas.width = defaultImage.width;
            modifiedCanvas.canvas.height = defaultImage.height;
            defaultCanvas.drawImage(defaultImage, 0, 0);
            modifiedCanvas.drawImage(modifiedImage, 0, 0);
            done();
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('detectDifferences should distinguish the differences correctly', () => {
        const expectedDifferences = 7;
        expect(defaultImage.complete).toBeTruthy();
        expect(modifiedImage.complete).toBeTruthy();
        cluster = service.detectDifferences(defaultCanvas, modifiedCanvas, '1') as number[][];
        expect(cluster.length).toEqual(expectedDifferences);
    });

    it('detectDifferences should expect undefined if any of the canvas is invalid', () => {
        const canvas: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        cluster = service.detectDifferences(canvas, canvas, '1') as number[][];
        expect(cluster).toBeUndefined();
    });

    it('detectDifferences should call comparePixels', () => {
        const spyComparePixel = spyOn(service, 'comparePixels');
        service.detectDifferences(defaultCanvas, modifiedCanvas, '1');
        expect(spyComparePixel).toHaveBeenCalled();
    });

    it('detectDifferences should call isHard', () => {
        const isHard = spyOn(service, 'isHard');
        service.detectDifferences(defaultCanvas, modifiedCanvas, '1');
        expect(isHard).toHaveBeenCalled();
    });

    it('isImageValid should be true if the image passed in context are 640 x 480', () => {
        expect(service.isImageValid(defaultCanvas)).toBeTruthy();
        expect(service.isImageValid(modifiedCanvas)).toBeTruthy();
    });

    it('isImageValid should be false if canvas is not the right size', () => {
        const invalidCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        expect(service.isImageValid(invalidCanvas)).toBeFalsy();
    });

    it('radius should return 0 if the radius is negative', () => {
        expect(defaultImage.complete).toBeTruthy();
        expect(modifiedImage.complete).toBeTruthy();
        cluster = service.detectDifferences(defaultCanvas, modifiedCanvas, '-1') as number[][];
        expect(service.radius).toEqual(0);
    });

    it('radius should return 0 if the radius is invalid', () => {
        expect(defaultImage.complete).toBeTruthy();
        expect(modifiedImage.complete).toBeTruthy();
        cluster = service.detectDifferences(defaultCanvas, modifiedCanvas, 'I FAILED TO PARSE') as number[][];
        expect(service.radius).toEqual(0);
    });

    it('colorizePixel should colorize the appropriate pixel', () => {
        const expectedColor = new Uint8ClampedArray([0, 0, 0, FULL_ALPHA]);
        service.comparisonArray = new Uint8ClampedArray(CHANNELS_PER_PIXEL);
        service.colorizePixel(0);
        expect(service.comparisonArray).toEqual(expectedColor);
    });

    it('addRadius should not colorize if pixel is out of range', () => {
        const spyOnColorize = spyOn(service, 'colorizePixel');
        service.initialDifferentPixels = TestConstants.OFF_BOUNDS_PIXELS;
        service.defaultImageArray = defaultCanvas.getImageData(0, 0, defaultCanvas.canvas.width, defaultCanvas.canvas.height).data;
        service.comparisonArray = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height).data;
        service.radius = 3;
        service.addRadius();
        expect(spyOnColorize).not.toHaveBeenCalled();
    });

    it('addRadius should call changeColor the correct amount of time', () => {
        const expectedTimes = 8;
        service.comparisonArray = new Uint8ClampedArray(CHANNELS_PER_PIXEL);
        const spyChangeColor = spyOn(service, 'colorizePixel');
        service.initialDifferentPixels = TestConstants.VALID_PIXELS;
        service.defaultImageArray = new Uint8ClampedArray(service.initialDifferentPixels.length);
        service.radius = 2;
        service.addRadius();
        expect(spyChangeColor).toHaveBeenCalledTimes(expectedTimes);
        expect(service.counter).toEqual(expectedTimes);
    });

    it('isHard should return false if the amount of differences is inputted incorrectly', () => {
        service.counter = TestConstants.NB_VALID_PIXELS;
        service.defaultImageArray = new Uint8ClampedArray(TestConstants.NB_TOTAL_PIXELS);
        const argument = NaN as number;
        expect(service.isHard(argument)).toBeFalsy();
    });

    it('isHard should return false if the amount of differences is inputted incorrectly', () => {
        service.counter = TestConstants.NB_VALID_PIXELS;
        service.defaultImageArray = new Uint8ClampedArray(TestConstants.NB_TOTAL_PIXELS);
        const argument = NaN as number;
        expect(service.isHard(argument)).toBeFalsy();
    });

    it('comparePixels should call changeColor the correct amount of time if the pixels are different', () => {
        const spyColorizePixel = spyOn(service, 'colorizePixel');
        const dataLength = TestConstants.DATA_LENGTH * CHANNELS_PER_PIXEL;
        service.initialDifferentPixels = [];
        service.defaultImageArray = new Uint8ClampedArray(dataLength);
        service.modifiedImageArray = new Uint8ClampedArray(dataLength);
        for (let i = 0; i < dataLength; i++) {
            service.modifiedImageArray[i] = 1;
            service.defaultImageArray[i] = 0;
        }
        service.comparePixels();
        expect(spyColorizePixel).toHaveBeenCalledTimes(TestConstants.DATA_LENGTH);
    });

    // it('listDifferences should call bfs the correct amount of time', () => {
    //     const spyBfs = spyOn(service, 'bfs');
    //     service.initialDifferentPixels = [1, 2, 3, 4, 5, 6];
    //     service.listDifferences();
    //     expect(spyBfs).toHaveBeenCalledTimes(6);
    // });
    // it('should return true if pixel is black', () => {
    //     service.comparisonArray = new Uint8ClampedArray(4);
    //     service.comparisonArray[0] = 0;
    //     service.comparisonArray[1] = 0;
    //     service.comparisonArray[2] = 0;
    //     expect(service.isPixelBlack(0)).toBeTruthy();
    // });
    // it('should return false if pixel is not black', () => {
    //     service.comparisonArray = new Uint8ClampedArray(4);
    //     service.comparisonArray[0] = 90;
    //     service.comparisonArray[1] = 0;
    //     service.comparisonArray[2] = 0;
    //     expect(service.isPixelBlack(0)).toBeFalsy();
    // });

    it('findAdjacentPixels should return a all adjacent pixels if they are all valid', () => {
        // Mock EXPECTED_WIDTH from difference.service.ts
        // const EXPECTED_WIDTH = 5;
        jasmine.createSpy('EXPECTED_WIDTH').and.returnValue(123);
        // expect(service.findAdjacentPixels(50)).toEqual([]);
        // const pixel = 8;
        // service.visited[pixel] = true;
        // service.comparisonArray = new Uint8ClampedArray(20);
        // service.defaultImageArray = new Uint8ClampedArray(20);
        // for (let i = 0; i < 12; i++) {
        //     service.comparisonArray[i] = 0;
        //     if (i === pixel) {
        //         service.visited[i] = true;
        //     } else if (i === 4) {
        //         service.comparisonArray[i] = 1;
        //     } else if (i % 4 === 0) {
        //         service.visited[i] = false;
        //     }
        // }
        // const result: Uint32List = [0, 8];
        // expect(service.findAdjacentPixels(pixel)).toEqual(result);
    });

    it('isPixelColored should return true if the pixel is colored', () => {
        service.comparisonArray = new Uint8ClampedArray([0, 0, 0, FULL_ALPHA]);
        expect(service.isPixelColored(0)).toBeTruthy();
    });

    it('isPixelColored should return false if the pixel is not colored', () => {
        service.comparisonArray = new Uint8ClampedArray([FULL_ALPHA, FULL_ALPHA, FULL_ALPHA, FULL_ALPHA]);
        expect(service.isPixelColored(0)).toBeFalsy();
    });
});

import { TestBed } from '@angular/core/testing';
import { Difference } from '@app/classes/difference';
import { Constants } from '@common/constants';
import { TestConstants } from '@common/test-constants';

import { DifferenceDetectorService } from './difference-detector.service';

import SpyObj = jasmine.SpyObj;

describe('DifferenceDetectorService', () => {
    let service: DifferenceDetectorService;
    let serviceSpy: SpyObj<DifferenceDetectorService>;
    let defaultCanvas: CanvasRenderingContext2D;
    let modifiedCanvas: CanvasRenderingContext2D;
    let defaultImage: HTMLImageElement;
    let modifiedImage: HTMLImageElement;

    beforeAll(async () => {
        defaultImage = new Image();
        modifiedImage = new Image();

        const defaultImageLoaded = new Promise<void>((resolve) => {
            defaultImage.src = './assets/test/image_7_diff.bmp';
            defaultImage.onload = () => {
                resolve();
            };
        });

        const modifiedImageLoaded = new Promise<void>((resolve) => {
            modifiedImage.src = './assets/test/image_empty.bmp';
            modifiedImage.onload = () => {
                resolve();
            };
        });

        // Both images have to be loaded before the tests can run.
        // It is only loaded once so it is not a performance timeout issue.
        await Promise.all([defaultImageLoaded, modifiedImageLoaded]);

        defaultCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        modifiedCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        defaultCanvas.canvas.width = defaultImage.width;
        defaultCanvas.canvas.height = defaultImage.height;
        modifiedCanvas.canvas.width = defaultImage.width;
        modifiedCanvas.canvas.height = defaultImage.height;
        defaultCanvas.drawImage(defaultImage, 0, 0);
        modifiedCanvas.drawImage(modifiedImage, 0, 0);
    });

    beforeEach(() => TestBed.configureTestingModule({}));

    beforeEach(async () => {
        service = TestBed.inject(DifferenceDetectorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('detectDifferences should distinguish the differences correctly', () => {
        expect(defaultImage.complete).toBeTruthy();
        expect(modifiedImage.complete).toBeTruthy();
        const expectedDifferences = 7;
        const differences = service.detectDifferences(defaultCanvas, modifiedCanvas, 1) as Difference;
        expect(differences.clusters.length).toEqual(expectedDifferences);
    });

    it('detectDifferences should expect undefined if any of the canvas is invalid', () => {
        serviceSpy = jasmine.createSpyObj('DifferenceDetectorService', ['detectDifferences', 'isImageValid']);
        serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
        serviceSpy.isImageValid.and.returnValue(false);

        const canvas: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const differences = serviceSpy.detectDifferences(canvas, canvas, 1) as Difference;
        expect(differences).toBeUndefined();
    });

    it('detectDifferences should call initializeData', () => {
        serviceSpy = jasmine.createSpyObj(
            'DifferenceDetectorService',
            ['detectDifferences', 'addRadius', 'isImageValid', 'initializeData', 'comparePixels', 'listDifferences', 'isHard'],
            { comparisonImage: defaultCanvas.getImageData(0, 0, defaultCanvas.canvas.width, defaultCanvas.canvas.height) },
        );
        serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
        serviceSpy.isImageValid.and.returnValue(true);
        serviceSpy.listDifferences.and.returnValue([]);

        serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, 0);
        expect(serviceSpy.initializeData).toHaveBeenCalledTimes(1);
    });

    it('detectDifferences should call comparePixels', () => {
        serviceSpy = jasmine.createSpyObj(
            'DifferenceDetectorService',
            ['detectDifferences', 'addRadius', 'isImageValid', 'initializeData', 'comparePixels', 'listDifferences', 'isHard'],
            { comparisonImage: defaultCanvas.getImageData(0, 0, defaultCanvas.canvas.width, defaultCanvas.canvas.height) },
        );
        serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
        serviceSpy.isImageValid.and.returnValue(true);
        serviceSpy.listDifferences.and.returnValue([]);

        serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, 0);
        expect(serviceSpy.comparePixels).toHaveBeenCalledTimes(1);
    });

    it('detectDifferences should call addRadius', () => {
        serviceSpy = jasmine.createSpyObj(
            'DifferenceDetectorService',
            ['detectDifferences', 'addRadius', 'isImageValid', 'initializeData', 'comparePixels', 'listDifferences', 'isHard'],
            { comparisonImage: defaultCanvas.getImageData(0, 0, defaultCanvas.canvas.width, defaultCanvas.canvas.height) },
        );
        serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
        serviceSpy.isImageValid.and.returnValue(true);
        serviceSpy.listDifferences.and.returnValue([]);

        serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, 0);
        expect(serviceSpy.addRadius).toHaveBeenCalledTimes(1);
    });

    it('detectDifferences should call isHard', () => {
        serviceSpy = jasmine.createSpyObj(
            'DifferenceDetectorService',
            ['detectDifferences', 'addRadius', 'isImageValid', 'initializeData', 'comparePixels', 'listDifferences', 'isHard'],
            { comparisonImage: defaultCanvas.getImageData(0, 0, defaultCanvas.canvas.width, defaultCanvas.canvas.height) },
        );
        serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
        serviceSpy.isImageValid.and.returnValue(true);
        serviceSpy.listDifferences.and.returnValue([]);

        serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, 0);
        expect(serviceSpy.isHard).toHaveBeenCalledTimes(1);
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
        serviceSpy = jasmine.createSpyObj(
            'DifferenceDetectorService',
            ['detectDifferences', 'addRadius', 'isImageValid', 'initializeData', 'comparePixels', 'listDifferences', 'isHard'],
            {
                comparisonImage: defaultCanvas.getImageData(0, 0, defaultCanvas.canvas.width, defaultCanvas.canvas.height),
                initialDifferentPixels: [],
            },
        );
        serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
        serviceSpy.addRadius.and.callFake(DifferenceDetectorService.prototype.addRadius);
        serviceSpy.isImageValid.and.returnValue(true);
        serviceSpy.listDifferences.and.returnValue([]);

        const negativeNumber = -1;
        serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, negativeNumber) as Difference;
        expect(serviceSpy.radius).toEqual(0);
    });

    it('radius should return 0 if the radius is invalid', () => {
        serviceSpy = jasmine.createSpyObj(
            'DifferenceDetectorService',
            ['detectDifferences', 'addRadius', 'isImageValid', 'initializeData', 'comparePixels', 'listDifferences', 'isHard'],
            {
                comparisonImage: defaultCanvas.getImageData(0, 0, defaultCanvas.canvas.width, defaultCanvas.canvas.height),
                initialDifferentPixels: [],
            },
        );
        serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
        serviceSpy.addRadius.and.callFake(DifferenceDetectorService.prototype.addRadius);
        serviceSpy.isImageValid.and.returnValue(true);
        serviceSpy.listDifferences.and.returnValue([]);

        serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, NaN) as Difference;
        expect(serviceSpy.radius).toEqual(0);
    });

    it('colorizePixel should colorize the appropriate pixel', () => {
        const expectedColor = new Uint8ClampedArray([0, 0, 0, Constants.FULL_ALPHA]);
        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.comparisonImage.data.set(new Uint8ClampedArray(Constants.PIXEL_SIZE));
        service.colorizePixel(0);
        expect(service.comparisonImage.data.slice(0, Constants.PIXEL_SIZE)).toEqual(expectedColor);
    });

    it('addRadius should not colorize if pixel is out of range', () => {
        const spyOnColorize = spyOn(service, 'colorizePixel');
        service.initialDifferentPixels = TestConstants.OFF_BOUNDS_PIXELS;
        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.radius = 3;
        service.addRadius();
        expect(spyOnColorize).not.toHaveBeenCalledTimes(1);
    });

    it('addRadius should call changeColor the correct amount of time', () => {
        const expectedTimes = 8;
        const spyChangeColor = spyOn(service, 'colorizePixel');

        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.initialDifferentPixels = TestConstants.PIXELS_TO_ADD_RADIUS;
        service.radius = 1;

        service.addRadius();
        expect(spyChangeColor).toHaveBeenCalledTimes(expectedTimes);
        expect(service.counter).toEqual(expectedTimes);
    });

    it('isHard should return false if the amount of differences is inputted incorrectly', () => {
        const argument = NaN;
        service.counter = TestConstants.NB_VALID_PIXELS;
        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.comparisonImage.data.set(new Uint8ClampedArray(TestConstants.NB_TOTAL_PIXELS));
        expect(service.isHard(argument)).toBeFalsy();
    });

    it('comparePixels should call changeColor the correct amount of time if the pixels are different', () => {
        const spyColorizePixel = spyOn(service, 'colorizePixel');
        const dataLength = TestConstants.DATA_LENGTH * Constants.PIXEL_SIZE;
        service.initialDifferentPixels = [];
        service.defaultImage = defaultCanvas.getImageData(0, 0, dataLength, 1);
        service.modifiedImage = modifiedCanvas.getImageData(0, 0, dataLength, 1);
        service.comparisonImage = defaultCanvas.createImageData(dataLength, 1);

        for (let i = 0; i < dataLength; i++) {
            service.modifiedImage.data[i] = 1;
            service.defaultImage.data[i] = 0;
        }

        service.comparePixels();
        expect(spyColorizePixel).toHaveBeenCalledTimes(TestConstants.DATA_LENGTH);
    });

    it('listDifferences should return the appropriate amount of differences', () => {
        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.initialDifferentPixels = TestConstants.LIST_OF_DIFFERENCES;
        service.visited = [];

        for (const position of service.initialDifferentPixels) {
            service.colorizePixel(position);
        }

        const differences = service.listDifferences();
        expect(differences.length).toEqual(TestConstants.EXPECTED_DIFFERENCES);
    });

    it('bfs should return the chunk of pixels desired', () => {
        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.visited = [];
        for (const position of TestConstants.CHUNK_OF_PIXELS) {
            service.colorizePixel(position);
        }
        const chunk = service.bfs(TestConstants.PIXEL_TO_FIND_ADJACENT).sort((a, b) => a - b);
        expect(chunk).toEqual(TestConstants.CHUNK_OF_PIXELS);
    });

    it('findAdjacentPixels should return all adjacent pixels if they are all valid', () => {
        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.visited = [];
        service.visited[TestConstants.PIXEL_TO_FIND_ADJACENT] = true;
        for (const position of TestConstants.ADJACENT_PIXELS) {
            service.colorizePixel(position);
        }
        const adjacent = service.findAdjacentPixels(TestConstants.PIXEL_TO_FIND_ADJACENT);
        expect(adjacent).toEqual(TestConstants.ADJACENT_PIXELS);
    });

    it('findAdjacentPixels should return an empty array if the pixel is invalid', () => {
        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.visited = [];
        const adjacent = service.findAdjacentPixels(NaN);
        expect(adjacent).toEqual([]);
    });

    it('isPixelColored should return true if the pixel is colored', () => {
        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.comparisonImage.data.set(new Uint8ClampedArray([0, 0, 0, Constants.FULL_ALPHA]));
        expect(service['isPixelColored'](0)).toBeTruthy();
    });

    it('isPixelColored should return false if the pixel is not colored', () => {
        service.comparisonImage = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
        service.comparisonImage.data.set(
            new Uint8ClampedArray([Constants.FULL_ALPHA, Constants.FULL_ALPHA, Constants.FULL_ALPHA, Constants.FULL_ALPHA]),
        );
        expect(service['isPixelColored'](0)).toBeFalsy();
    });
});

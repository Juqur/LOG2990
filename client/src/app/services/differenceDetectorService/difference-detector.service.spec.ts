import { TestBed } from '@angular/core/testing';
import { LevelDifferences } from '@app/classes/difference';
import { Constants } from '@common/constants';
import { TestConstants } from '@common/test-constants';

import { DifferenceDetectorService } from '@app/services/differenceDetectorService/difference-detector.service';

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

    describe('detectDifferences', () => {
        beforeEach(() => {
            serviceSpy = jasmine.createSpyObj(
                'DifferenceDetectorService',
                ['detectDifferences', 'addRadius', 'isImageValid', 'initializeData', 'comparePixels', 'listDifferences', 'isHard'],
                { comparisonImage: defaultCanvas.getImageData(0, 0, defaultCanvas.canvas.width, defaultCanvas.canvas.height) },
            );
            serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
            serviceSpy['listDifferences'] = () => [];
            serviceSpy['isImageValid'] = () => true;
        });

        it('should distinguish the differences correctly', () => {
            expect(defaultImage.complete).toBeTruthy();
            expect(modifiedImage.complete).toBeTruthy();
            const expectedDifferences = 7;
            const differences = service.detectDifferences(defaultCanvas, modifiedCanvas, 1) as LevelDifferences;
            expect(differences.clusters.length).toEqual(expectedDifferences);
        });

        it('should expect undefined if any of the canvas is invalid', () => {
            serviceSpy = jasmine.createSpyObj('DifferenceDetectorService', ['detectDifferences', 'isImageValid']);
            serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
            serviceSpy['isImageValid'] = () => false;

            const canvas: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
            const differences = serviceSpy.detectDifferences(canvas, canvas, 1) as LevelDifferences;
            expect(differences).toBeUndefined();
        });

        it('should call initializeData', () => {
            serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, 0);
            expect(serviceSpy['initializeData']).toHaveBeenCalledTimes(1);
        });

        it('should call comparePixels', () => {
            serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, 0);
            expect(serviceSpy['comparePixels']).toHaveBeenCalledTimes(1);
        });

        it('should call addRadius', () => {
            serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, 0);
            expect(serviceSpy['addRadius']).toHaveBeenCalledTimes(1);
        });

        it('should call isHard', () => {
            serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, 0);
            expect(serviceSpy['isHard']).toHaveBeenCalledTimes(1);
        });
    });

    describe('isImageValid', () => {
        it('should be true if the image passed in context are 640 x 480', () => {
            expect(service['isImageValid'](defaultCanvas)).toBeTruthy();
            expect(service['isImageValid'](modifiedCanvas)).toBeTruthy();
        });

        it('should be false if canvas is not the right size', () => {
            const invalidCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            expect(service['isImageValid'](invalidCanvas)).toBeFalsy();
        });
    });

    describe('radius', () => {
        beforeEach(() => {
            serviceSpy = jasmine.createSpyObj(
                'DifferenceDetectorService',
                ['detectDifferences', 'addRadius', 'isImageValid', 'initializeData', 'comparePixels', 'listDifferences', 'isHard'],
                {
                    comparisonImage: defaultCanvas.getImageData(0, 0, defaultCanvas.canvas.width, defaultCanvas.canvas.height),
                    initialDifferentPixels: [],
                },
            );
            serviceSpy.detectDifferences.and.callFake(DifferenceDetectorService.prototype.detectDifferences);
            serviceSpy['addRadius'] = DifferenceDetectorService.prototype['addRadius'];
            serviceSpy['isImageValid'] = () => true;
            serviceSpy['listDifferences'] = () => [];
        });

        it('should return 0 if the radius is negative', () => {
            const negativeNumber = -1;
            serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, negativeNumber) as LevelDifferences;
            expect(serviceSpy['radius']).toEqual(0);
        });

        it('should return 0 if the radius is invalid', () => {
            serviceSpy.detectDifferences(defaultCanvas, modifiedCanvas, NaN) as LevelDifferences;
            expect(serviceSpy['radius']).toEqual(0);
        });
    });

    describe('colorizePixel', () => {
        it('should colorize the appropriate pixel', () => {
            const expectedColor = new Uint8ClampedArray([0, 0, 0, Constants.FULL_ALPHA]);
            service['comparisonImage'] = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
            service['comparisonImage'].data.set(new Uint8ClampedArray(Constants.PIXEL_SIZE));
            service['colorizePixel'](0);
            expect(service['comparisonImage'].data.slice(0, Constants.PIXEL_SIZE)).toEqual(expectedColor);
        });
    });

    describe('addRadius', () => {
        let spyOnColorize: jasmine.Spy<never>;

        beforeEach(() => {
            spyOnColorize = spyOn(service, 'colorizePixel' as never);
            service['comparisonImage'] = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
            service['radius'] = 1;
        });

        it('should not colorize if pixel is out of range', () => {
            service['initialDifferentPixels'] = TestConstants.OFF_BOUNDS_PIXELS;

            service['addRadius']();
            expect(spyOnColorize).not.toHaveBeenCalledTimes(1);
        });

        it('should call changeColor the correct amount of time', () => {
            const expectedNeighbors = 8;
            service['initialDifferentPixels'] = TestConstants.PIXELS_TO_ADD_RADIUS;

            service['addRadius']();
            expect(spyOnColorize).toHaveBeenCalledTimes(expectedNeighbors);
            expect(service['counter']).toEqual(expectedNeighbors);
        });

        it('should not consider pixels that exceeds the right border', () => {
            const expectedNeighbors = 3;
            service['initialDifferentPixels'] = [TestConstants.ADJACENT_PIXELS_TEST2[0]]; // x = 439, y = 0

            service['addRadius']();
            expect(spyOnColorize).toHaveBeenCalledTimes(expectedNeighbors);
        });

        it('should not consider pixels that exceeds the left border', () => {
            const expectedNeighbors = 4;
            service['initialDifferentPixels'] = [TestConstants.ADJACENT_PIXELS_TEST2[1]]; // x = 1, y = 1

            service['addRadius']();
            expect(spyOnColorize).toHaveBeenCalledTimes(expectedNeighbors);
        });
    });

    describe('isHard', () => {
        it('should return false if the amount of differences is inputted incorrectly', () => {
            const argument = NaN;
            service['counter'] = TestConstants.NB_VALID_PIXELS;
            service['comparisonImage'] = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
            service['comparisonImage'].data.set(new Uint8ClampedArray(TestConstants.NB_TOTAL_PIXELS));
            expect(service['isHard'](argument)).toBeFalsy();
        });
    });

    describe('comparePixels', () => {
        it('should call changeColor the correct amount of time if the pixels are different', () => {
            const spyColorizePixel = spyOn(service, 'colorizePixel' as never);
            const dataLength = TestConstants.DATA_LENGTH * Constants.PIXEL_SIZE;
            service['initialDifferentPixels'] = [];
            service['defaultImage'] = defaultCanvas.getImageData(0, 0, dataLength, 1);
            service['modifiedImage'] = modifiedCanvas.getImageData(0, 0, dataLength, 1);
            service['comparisonImage'] = defaultCanvas.createImageData(dataLength, 1);

            for (let i = 0; i < dataLength; i++) {
                service['modifiedImage'].data[i] = 1;
                service['defaultImage'].data[i] = 0;
            }

            service['comparePixels']();
            expect(spyColorizePixel).toHaveBeenCalledTimes(TestConstants.DATA_LENGTH);
        });
    });

    describe('listDifferences', () => {
        it('should return the appropriate amount of differences', () => {
            service['comparisonImage'] = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
            service['initialDifferentPixels'] = TestConstants.LIST_OF_DIFFERENCES;
            service['visited'] = [];

            for (const position of service['initialDifferentPixels']) {
                service['colorizePixel'](position);
            }

            const differences = service['listDifferences']();
            expect(differences.length).toEqual(TestConstants.EXPECTED_DIFFERENCES);
        });
    });

    describe('bfs', () => {
        it('should return the chunk of pixels desired', () => {
            service['comparisonImage'] = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
            service['visited'] = [];
            for (const position of TestConstants.CHUNK_OF_PIXELS) {
                service['colorizePixel'](position);
            }
            const chunk = service['bfs'](TestConstants.PIXEL_TO_FIND_ADJACENT).sort((a, b) => a - b);
            expect(chunk).toEqual(TestConstants.CHUNK_OF_PIXELS);
        });
    });

    describe('findAdjacentPixels', () => {
        beforeEach(() => {
            service['comparisonImage'] = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
            service['visited'] = [];
        });

        it('should return all adjacent pixels if they are all valid', () => {
            service['isPixelColored'] = () => true;
            service['visited'][TestConstants.PIXEL_TO_FIND_ADJACENT] = true;
            const adjacent = service['findAdjacentPixels'](TestConstants.PIXEL_TO_FIND_ADJACENT).sort((a, b) => a - b);
            expect(adjacent).toEqual(TestConstants.ADJACENT_PIXELS_TEST1);
        });

        it('should return an empty array if the pixel is invalid', () => {
            service['isPixelColored'] = () => true;
            const adjacent = service['findAdjacentPixels'](NaN);
            expect(adjacent).toEqual([]);
        });

        it('should not consider the neighbors pixels that exceeds the right border', () => {
            const leftPixel = 2556;
            service['visited'][leftPixel] = true;
            for (const position of TestConstants.ADJACENT_PIXELS_TEST2) {
                service['colorizePixel'](position);
            }

            const adjacentToLeft = service['findAdjacentPixels'](leftPixel);
            expect(adjacentToLeft).toEqual([]);
        });

        it('should not consider the neighbors pixels that exceeds the left border', () => {
            const rightPixel = 2560;
            service['visited'][rightPixel] = true;
            for (const position of TestConstants.ADJACENT_PIXELS_TEST2) {
                service['colorizePixel'](position);
            }

            const adjacentToLeft = service['findAdjacentPixels'](rightPixel);
            expect(adjacentToLeft).toEqual([]);
        });
    });

    describe('isPixelColored', () => {
        it('should return true if the pixel is colored', () => {
            service['comparisonImage'] = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
            service['comparisonImage'].data.set(new Uint8ClampedArray([0, 0, 0, Constants.FULL_ALPHA]));
            expect(service['isPixelColored'](0)).toBeTruthy();
        });

        it('should return false if the pixel is not colored', () => {
            service['comparisonImage'] = defaultCanvas.createImageData(defaultCanvas.canvas.width, defaultCanvas.canvas.height);
            service['comparisonImage'].data.set(
                new Uint8ClampedArray([Constants.FULL_ALPHA, Constants.FULL_ALPHA, Constants.FULL_ALPHA, Constants.FULL_ALPHA]),
            );
            expect(service['isPixelColored'](0)).toBeFalsy();
        });
    });
});

import { Injectable } from '@angular/core';

/* Bitmap 24 bits per pixel */
export const CHANNELS_PER_PIXEL = 4;
export const EXPECTED_WIDTH = 640;
export const EXPECTED_HEIGHT = 480;

@Injectable({
    providedIn: 'root',
})
export class DifferenceDetectorService {
    defaultImageArray: Uint8ClampedArray;
    modifiedImageArray: Uint8ClampedArray;
    comparisonArray: Uint8ClampedArray;
    initialDifferentPixels: number[] = [];
    radius: number;
    counter: number = 0;
    visited: boolean[] = [];
    differences: number = 0;

    detectDifferences(defaultImage: CanvasRenderingContext2D, modifiedImage: CanvasRenderingContext2D, radius: string) {
        if (Number(radius) <= 0) {
            return;
        }

        if (!this.isImageValid(defaultImage) || !this.isImageValid(modifiedImage)) {
            return;
        }

        // Initializing data.
        const defaultImageData = defaultImage.getImageData(0, 0, defaultImage.canvas.width, defaultImage.canvas.height);
        const modifiedImageData = modifiedImage.getImageData(0, 0, modifiedImage.canvas.width, modifiedImage.canvas.height);
        const comparisonData = defaultImage.createImageData(defaultImage.canvas.width, defaultImage.canvas.height);
        this.defaultImageArray = defaultImageData.data;
        this.modifiedImageArray = modifiedImageData.data;
        this.comparisonArray = comparisonData.data;
        this.radius = Number(radius);

        // Processing data.
        this.comparePixels();
        console.log('Initial different pixels: ');
        console.log(this.initialDifferentPixels);
        this.addRadius();
        this.chooseDifficulty();

        console.log('Final different pixels: ');
        console.log(this.listDifferences());
        const differenceCanvas = document.createElement('canvas').getContext('2d');
        if (!differenceCanvas) {
            return;
        }
        differenceCanvas.canvas.width = defaultImage.canvas.width;
        differenceCanvas.canvas.height = defaultImage.canvas.height;
        differenceCanvas.putImageData(comparisonData, 0, 0);
        document.body.appendChild(differenceCanvas.canvas);
    }

    /**
     * Compares the pixels of the two images and
     * generates the new image with the differences.
     */
    comparePixels(): void {
        const channelsPerPixel = 4;
        const white = [255, 255, 255];
        const black = [0, 0, 0];
        for (let i = 0; i < this.defaultImageArray.length; i += channelsPerPixel) {
            const r = this.defaultImageArray[i];
            const g = this.defaultImageArray[i + 1];
            const b = this.defaultImageArray[i + 2];
            const r2 = this.modifiedImageArray[i];
            const g2 = this.modifiedImageArray[i + 1];
            const b2 = this.modifiedImageArray[i + 2];
            if (r !== r2 || g !== g2 || b !== b2) {
                if (i >= 0 && i < this.defaultImageArray.length) {
                    this.changeColor(i, black);
                    this.initialDifferentPixels.push(i);
                }
            } else {
                this.changeColor(i, white);
            }
        }
    }

    /**
     * Verifies if the image is valid.
     * The image must be 640x480 and 24 bits.
     *
     * @param image The image to verify.
     * @returns True if the image is valid, false otherwise.
     */
    isImageValid(image: CanvasRenderingContext2D): boolean {
        // Checks the number of color channels in the image, which should be 4 for a 24-bit image.
        if (image.getImageData(0, 0, 1, 1).data.length !== CHANNELS_PER_PIXEL) {
            return false;
        }

        // Check the canvas size
        const width = image.canvas.width;
        const height = image.canvas.height;
        return width === EXPECTED_WIDTH && height === EXPECTED_HEIGHT;
    }

    addRadius(): void {
        for (const pixel of this.initialDifferentPixels) {
            for (let i = -this.radius; i < this.radius; i++) {
                for (let j = -this.radius; j < this.radius; j++) {
                    const pixelPosition = i * CHANNELS_PER_PIXEL + j * CHANNELS_PER_PIXEL * EXPECTED_WIDTH + pixel;
                    const distance = Math.pow(i, 2) + Math.pow(j, 2);
                    if (pixelPosition >= 0 && pixelPosition < this.defaultImageArray.length && distance <= Math.pow(this.radius, 2)) {
                        this.changeColor(pixelPosition, [0, 0, 0]);
                        this.counter++;
                    }
                }
            }
        }
    }

    chooseDifficulty(): boolean {
        const rate = this.counter / this.defaultImageArray.length;
        // console.log(rate);
        return rate < 0.15 && this.differences >= 7;
    }

    changeColor(pixelPosition: number, color: number[]): void {
        this.comparisonArray[pixelPosition] = color[0];
        this.comparisonArray[pixelPosition + 1] = color[1];
        this.comparisonArray[pixelPosition + 2] = color[2];
        this.comparisonArray[pixelPosition + 3] = 255;
    }

    listDifferences(): number[][] {
        const listOfDifferences: number[][] = [];
        for (const pixel of this.initialDifferentPixels) {
            if (!this.visited[pixel]) {
                listOfDifferences.push(this.bfs(pixel));
            }
        }
        return listOfDifferences;
    }

    bfs(pixel: number): number[] {
        const queue: number[] = [];
        const cluster: number[] = [];

        queue.push(pixel);
        this.visited[pixel] = true;

        while (queue.length !== 0) {
            const currentPixel = queue.pop(); // I'm not sure if this is the best way to do it.
            if (currentPixel) {
                this.visited[currentPixel] = true;
                cluster.push(currentPixel);
                const adjacentPixels = this.findAdjacentPixels(currentPixel);
                queue.push(...adjacentPixels);
            }
        }

        return cluster;
    }

    findAdjacentPixels(pixel: number): Uint32List {
        const adjacentPixels: number[] = [];

        for (let i = -1; i < 1; i++) {
            for (let j = -1; j < 1; j++) {
                const pixelPosition = i * CHANNELS_PER_PIXEL + j * CHANNELS_PER_PIXEL * EXPECTED_WIDTH + pixel;
                // Checks if the pixel is inside the image.
                if (pixelPosition < 0 || pixelPosition > this.defaultImageArray.length) {
                    continue;
                }
                // Checks if the pixel has already been visited.
                if (this.visited[pixelPosition] === true) {
                    continue;
                }
                // Checks if the pixel is black.
                if (!this.isPixelBlack(pixelPosition)) {
                    continue;
                }

                adjacentPixels.push(pixelPosition);
            }
        }

        return adjacentPixels;
    }

    isPixelBlack(pixel: number): boolean {
        return this.comparisonArray[pixel] === 0 && this.comparisonArray[pixel + 1] === 0 && this.comparisonArray[pixel + 2] === 0;
    }
}

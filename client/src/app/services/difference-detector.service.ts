import { Injectable } from '@angular/core';

/* Bitmap 24 bits per pixel */
export const CHANNELS_PER_PIXEL = 4;
export const EXPECTED_WIDTH = 640;
export const EXPECTED_HEIGHT = 480;
export const DIFFICULTY_RATIO = 0.15;
export const MIN_DIFFERENCES = 7;
export const FULL_ALPHA = 255;

@Injectable({
    providedIn: 'root',
})
export class DifferenceDetectorService {
    defaultImageArray: Uint8ClampedArray;
    modifiedImageArray: Uint8ClampedArray;
    comparisonArray: Uint8ClampedArray;
    initialDifferentPixels: number[];
    clusters: number[][];
    radius: number;
    counter: number = 0;
    visited: boolean[];

    /**
     * Detects the differences between two images.
     * The image must be 640x480 and 24 bits.
     *
     * @param defaultImage The image to compare.
     * @param modifiedImage The other image to compare.
     * @param radius The radius of the pixels to change.
     * @return The clusters of pixels that are different.
     */
    detectDifferences(defaultImage: CanvasRenderingContext2D, modifiedImage: CanvasRenderingContext2D, radius: string) {
        // Ensures image format is valid.
        if (!this.isImageValid(defaultImage) || !this.isImageValid(modifiedImage)) {
            return undefined;
        }

        // Initializing data.
        const defaultImageData = defaultImage.getImageData(0, 0, defaultImage.canvas.width, defaultImage.canvas.height);
        const modifiedImageData = modifiedImage.getImageData(0, 0, modifiedImage.canvas.width, modifiedImage.canvas.height);
        const comparisonData = defaultImage.createImageData(defaultImage.canvas.width, defaultImage.canvas.height);
        this.defaultImageArray = defaultImageData.data;
        this.modifiedImageArray = modifiedImageData.data;
        this.comparisonArray = comparisonData.data;
        this.radius = Number(radius);
        this.initialDifferentPixels = [];
        this.visited = [];

        // Processing data.
        this.comparePixels();
        this.addRadius();
        const cluster = this.listDifferences();
        this.isHard(cluster.length);

        // Displaying data.
        const differenceCanvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        differenceCanvas.canvas.width = defaultImage.canvas.width;
        differenceCanvas.canvas.height = defaultImage.canvas.height;
        differenceCanvas.putImageData(comparisonData, 0, 0);
        document.body.appendChild(differenceCanvas.canvas);

        // console.log(this.initialDifferentPixels);
        // console.log(cluster);
        return cluster;
    }

    /**
     * Verifies if the image is valid.
     * The image must be 640x480 and 24 bits.
     *
     * @param image The image to verify.
     * @returns True if the image is valid, false otherwise.
     */
    isImageValid(image: CanvasRenderingContext2D): boolean {
        const width = image.canvas.width;
        const height = image.canvas.height;
        return width === EXPECTED_WIDTH && height === EXPECTED_HEIGHT;
    }

    /**
     * Returns if the pixel is in bound.
     *
     * @returns True if the pixel is in bound, false otherwise.
     */
    isInBounds(position: number): boolean {
        return position >= 0 && position < this.defaultImageArray.length;
    }

    /**
     * Compares the pixels of the two images and
     * generates the new image with the differences.
     */
    comparePixels(): void {
        for (let i = 0; i < this.defaultImageArray.length; i += CHANNELS_PER_PIXEL) {
            const r = this.defaultImageArray[i];
            const g = this.defaultImageArray[i + 1];
            const b = this.defaultImageArray[i + 2];
            const r2 = this.modifiedImageArray[i];
            const g2 = this.modifiedImageArray[i + 1];
            const b2 = this.modifiedImageArray[i + 2];
            if (r !== r2 || g !== g2 || b !== b2) {
                if (this.isInBounds(i)) {
                    this.colorizePixel(i);
                    this.initialDifferentPixels.push(i);
                }
            }
        }
    }

    /**
     * Applies the radius to the initial different pixels.
     * The pixels within the radius are then included.
     */
    addRadius(): void {
        if (this.radius < 0 || isNaN(this.radius)) {
            this.radius = 0;
        }

        for (const pixel of this.initialDifferentPixels) {
            // Ensures the pixel is in the image.
            if (!this.isInBounds(pixel) || NaN) {
                continue;
            }

            for (let i = -this.radius; i <= this.radius; i++) {
                for (let j = -this.radius; j <= this.radius; j++) {
                    const pixelPosition = (i * EXPECTED_WIDTH + j) * CHANNELS_PER_PIXEL + pixel;
                    const distance = Math.pow(i, 2) + Math.pow(j, 2);
                    if (this.isInBounds(pixelPosition) && distance <= Math.pow(this.radius, 2)) {
                        this.colorizePixel(pixelPosition);
                        this.counter++;
                    }
                }
            }
        }
    }

    /**
     * Defines if the pair of difference is easy or hard.
     *
     * @returns True if the pair of difference is hard, false otherwise.
     */
    isHard(nbDifferences: number): boolean {
        const rate = this.counter / this.defaultImageArray.length;
        return rate < DIFFICULTY_RATIO && nbDifferences >= MIN_DIFFERENCES;
    }

    /**
     * Colorizes the pixel to the new array as to signify a difference.
     * Note here: the pixel needs to be visible in the new image (using alpha channel).
     *
     * @param position The position of the pixel in the array.
     */
    colorizePixel(position: number): void {
        this.comparisonArray[position] = 0;
        this.comparisonArray[position + 1] = 0;
        this.comparisonArray[position + 2] = 0;
        this.comparisonArray[position + 3] = FULL_ALPHA;
    }

    /**
     * Lists the differences between the two images as clusters
     *
     * @returns A list of clusters, where each cluster is a list of pixels.
     */
    listDifferences(): number[][] {
        const listOfDifferences: number[][] = [];
        for (const pixel of this.initialDifferentPixels) {
            if (!this.visited[pixel]) {
                listOfDifferences.push(this.bfs(pixel));
            }
        }
        return listOfDifferences;
    }

    /**
     * Breath-first search algorithm to find the clusters of different pixels.
     *
     * @param pixel The pixel to start the search.
     * @returns A list of pixels that are part of the same cluster.
     */
    bfs(pixel: number): number[] {
        const queue: number[] = [];
        const cluster: number[] = [];
        queue.push(pixel);

        while (queue.length > 0) {
            const currentPixel = queue.shift() as number;
            if (!this.visited[currentPixel]) {
                this.visited[currentPixel] = true;
                cluster.push(currentPixel);
                const adjacentPixels = this.findAdjacentPixels(currentPixel);
                queue.push(...adjacentPixels);
            }
        }

        return cluster;
    }

    /**
     * Finds the adjacent pixels of a given pixel.
     * Note: The pixel is in flat-map format.
     *
     * @param pixel The pixel to start the search.
     * @returns A list of pixels that are adjacent and valid to the pixel.
     */
    findAdjacentPixels(pixel: number): number[] {
        const adjacentPixels: number[] = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const pixelPosition = (i * EXPECTED_WIDTH + j) * CHANNELS_PER_PIXEL + pixel;
                // Checks if the pixel is inside the image.
                if (pixelPosition < 0 || pixelPosition > this.defaultImageArray.length) {
                    continue;
                }
                // Checks if the pixel has already been visited.
                if (this.visited[pixelPosition] === true) {
                    continue;
                }
                // Checks if the pixel is black.
                if (!this.isPixelColored(pixelPosition)) {
                    continue;
                }
                adjacentPixels.push(pixelPosition);
            }
        }

        return adjacentPixels;
    }

    /**
     * Internal method that verifies if the pixel is colored.
     * Note: It is important that the pixel's alpha is visible
     * because the array's values are equal to 0 to all channels.
     *
     * @param pixel The pixel to start the search.
     * @returns A list of pixels that are adjacent and valid to the pixel.
     */
    private isPixelColored(pixel: number): boolean {
        return (
            this.comparisonArray[pixel] === 0 &&
            this.comparisonArray[pixel + 1] === 0 &&
            this.comparisonArray[pixel + 2] === 0 &&
            this.comparisonArray[pixel + 3] === FULL_ALPHA
        );
    }
}

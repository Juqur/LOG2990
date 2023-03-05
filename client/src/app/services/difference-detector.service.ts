import { Injectable } from '@angular/core';
import { Difference } from '@app/classes/difference';
import { Constants } from '@common/constants';

/**
 * This service is used to establish the differences between two images.
 * Only used when creating a new level.
 *
 * @author Pierre Tran & Junaid Qureshi
 * @class DifferenceDetectorService
 */
@Injectable({
    providedIn: 'root',
})
export class DifferenceDetectorService {
    private defaultImage: ImageData;
    private modifiedImage: ImageData;
    private comparisonImage: ImageData;
    private initialDifferentPixels: number[];
    private radius: number;
    private counter: number = 0;
    private visited: boolean[];

    /**
     * Detects the differences between two images.
     * The image must be 640x480 and 24 bits.
     *
     * @param defaultImage The image to compare.
     * @param modifiedImage The other image to compare.
     * @param radius The radius of the pixels to change.
     * @return The clusters of pixels that are different.
     */
    detectDifferences(defaultImage: CanvasRenderingContext2D, modifiedImage: CanvasRenderingContext2D, radius: number): Difference | undefined {
        // Ensures image format is valid.
        if (!this.isImageValid(defaultImage) || !this.isImageValid(modifiedImage)) {
            return undefined;
        }

        // Initializing data.
        this.initializeData(defaultImage, modifiedImage, radius);

        // Processing data.
        this.comparePixels();
        this.addRadius();

        const differences = new Difference();
        const differenceCanvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        differenceCanvas.canvas.width = defaultImage.canvas.width;
        differenceCanvas.canvas.height = defaultImage.canvas.height;
        differenceCanvas.putImageData(this.comparisonImage, 0, 0);

        differences.canvas = differenceCanvas;
        differences.clusters = this.listDifferences();
        differences.isHard = this.isHard(differences.clusters.length);

        return differences;
    }

    /**
     * Resets the properties of the service..
     *
     * @param defaultImage The image to compare.
     * @param modifiedImage The other image to compare.
     * @param radius The radius of the pixels to change.
     */
    private initializeData(defaultImage: CanvasRenderingContext2D, modifiedImage: CanvasRenderingContext2D, radius: number): void {
        this.defaultImage = defaultImage.getImageData(0, 0, defaultImage.canvas.width, defaultImage.canvas.height);
        this.modifiedImage = modifiedImage.getImageData(0, 0, modifiedImage.canvas.width, modifiedImage.canvas.height);
        this.comparisonImage = defaultImage.createImageData(defaultImage.canvas.width, defaultImage.canvas.height);
        this.radius = radius;
        this.initialDifferentPixels = [];
        this.visited = [];
    }

    /**
     * Verifies if the image is valid.
     * The image must be 640x480 and 24 bits.
     *
     * @param image The image to verify.
     * @returns True if the image is valid, false otherwise.
     */
    private isImageValid(image: CanvasRenderingContext2D): boolean {
        const width = image.canvas.width;
        const height = image.canvas.height;
        return width === Constants.EXPECTED_WIDTH && height === Constants.EXPECTED_HEIGHT;
    }

    /**
     * Returns if the pixel is in bound.
     *
     * @returns True if the pixel is in bound, false otherwise.
     */
    private isInBounds(position: number): boolean {
        return position >= 0 && position < this.comparisonImage.data.length;
    }

    /**
     * Compares the pixels of the two images and
     * generates the new image with the differences.
     */
    private comparePixels(): void {
        for (let i = 0; i < this.defaultImage.data.length; i += Constants.PIXEL_SIZE) {
            const r = this.defaultImage.data[i];
            const g = this.defaultImage.data[i + 1];
            const b = this.defaultImage.data[i + 2];
            const r2 = this.modifiedImage.data[i];
            const g2 = this.modifiedImage.data[i + 1];
            const b2 = this.modifiedImage.data[i + 2];
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
    private addRadius(): void {
        if (this.radius < 0 || isNaN(this.radius)) {
            this.radius = 0;
        }

        for (const pixel of this.initialDifferentPixels) {
            // Ensures the pixel is in the image.
            if (!this.isInBounds(pixel) || NaN || pixel % Constants.PIXEL_SIZE !== 0) {
                continue;
            }

            for (let i = -this.radius; i <= this.radius; i++) {
                for (let j = -this.radius; j <= this.radius; j++) {
                    const pixelPosition = (i * Constants.EXPECTED_WIDTH + j) * Constants.PIXEL_SIZE + pixel;
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
    private isHard(nbDifferences: number): boolean {
        const rate = this.counter / this.comparisonImage.data.length;
        return rate < Constants.MIN_DIFFICULTY_RATIO && nbDifferences >= Constants.MIN_DIFFERENCES;
    }

    /**
     * Colorizes the pixel to the new array as to signify a difference.
     * Note here: the pixel needs to be visible in the new image (using alpha channel).
     *
     * @param position The position of the pixel in the array.
     */
    private colorizePixel(position: number): void {
        this.comparisonImage.data[position] = 0;
        this.comparisonImage.data[position + 1] = 0;
        this.comparisonImage.data[position + 2] = 0;
        this.comparisonImage.data[position + 3] = Constants.FULL_ALPHA;
    }

    /**
     * Lists the differences between the two images as clusters
     *
     * @returns A list of clusters, where each cluster is a list of pixels.
     */
    private listDifferences(): number[][] {
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
    private bfs(pixel: number): number[] {
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
    private findAdjacentPixels(pixel: number): number[] {
        const adjacentPixels: number[] = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const pixelPosition = (i * Constants.EXPECTED_WIDTH + j) * Constants.PIXEL_SIZE + pixel;
                // Checks if the pixel is inside the image.
                if (!this.isInBounds(pixelPosition)) {
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
            this.comparisonImage.data[pixel] === 0 &&
            this.comparisonImage.data[pixel + 1] === 0 &&
            this.comparisonImage.data[pixel + 2] === 0 &&
            this.comparisonImage.data[pixel + 3] === Constants.FULL_ALPHA
        );
    }
}

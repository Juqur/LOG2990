import { Injectable } from '@angular/core';

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

        // if (!this.isImageValid(defaultImage) || !this.isImageValid(modifiedImage)) {
        //     return;
        // }

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
        this.addRadius(defaultImage.canvas.width);
        this.chooseDifficulty();
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

    addRadius(width: number): void {
        if (this.radius === 0) return;
        for (const pixel of this.initialDifferentPixels) {
            for (let i = -this.radius; i < this.radius; i++) {
                for (let j = -this.radius; j < this.radius; j++) {
                    const pixelPosition = i * 4 + j * 4 * width + pixel;
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
        return rate < 0.15 && this.differences >= 7;
    }

    changeColor(pixelPosition: number, color: number[]): void {
        this.comparisonArray[pixelPosition] = color[0];
        this.comparisonArray[pixelPosition + 1] = color[1];
        this.comparisonArray[pixelPosition + 2] = color[2];
        this.comparisonArray[pixelPosition + 3] = 255;
    }

    // private listDifferences() {
    //     for (let i = 0; i < this.differenceImageData.length; i += 4) {
    //         this.visited[i] = true;
    //         const r = this.differenceImageData[i];
    //         const g = this.differenceImageData[i + 1];
    //         const b = this.differenceImageData[i + 2];
    //         if (r === 0 && g === 0 && b === 0) {
    //             continue;
    //         }
    //     }
    // }

    // private bfs(pixel: number) {}
}

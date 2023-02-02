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
        const secondImageData = modifiedImage.getImageData(0, 0, modifiedImage.canvas.width, modifiedImage.canvas.height);
        const comparisonData = defaultImage.createImageData(defaultImage.canvas.width, defaultImage.canvas.height);
        this.defaultImageArray = defaultImageData.data;
        this.modifiedImageArray = secondImageData.data;
        this.comparisonArray = comparisonData.data;
        this.radius = Number(radius);

        // Processing data.
        this.comparePixels();
        this.addRadius(defaultImage);
        const differenceCanvas = document.createElement('canvas').getContext('2d');
        if (!differenceCanvas) {
            return;
        }
        differenceCanvas.canvas.width = defaultImage.canvas.width;
        differenceCanvas.canvas.height = defaultImage.canvas.width;
        differenceCanvas.putImageData(comparisonData, 0, 0);
        document.body.appendChild(differenceCanvas.canvas);
    }

    private comparePixels() {
        const channelsPerPixel = 4;
        for (let i = 0; i < this.defaultImageArray.length; i += channelsPerPixel) {
            const r = this.defaultImageArray[i];
            const g = this.defaultImageArray[i + 1];
            const b = this.defaultImageArray[i + 2];
            const r2 = this.modifiedImageArray[i];
            const g2 = this.modifiedImageArray[i + 1];
            const b2 = this.modifiedImageArray[i + 2];
            if (r - r2 > 0 || g - g2 > 0 || b - b2 > 0) {
                if (i >= 0 && i < this.defaultImageArray.length) {
                    this.changeColor(i, [0, 0, 0]);
                    this.initialDifferentPixels.push(i);
                }
            } else {
                this.changeColor(i, [255, 255, 255]);
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
    private isImageValid(image: CanvasRenderingContext2D): boolean {
        const expectedWidth = 640;
        const expectedHeight = 480;
        const expectedChannels = 4;

        // Checks the number of color channels in the image, which should be 4 for a 24-bit image.
        if (image.getImageData(0, 0, 1, 1).data.length !== expectedChannels) {
            return false;
        }

        // Check the canvas size
        const width = image.canvas.width;
        const height = image.canvas.height;
        return width === expectedWidth && height === expectedHeight;
    }

    private addRadius(defaultImage: CanvasRenderingContext2D) {
        for (const pixel of this.initialDifferentPixels) {
            for (let i = -this.radius; i < this.radius; i++) {
                for (let j = -this.radius; j < this.radius; j++) {
                    const pixelPosition = i * 4 + j * 4 * defaultImage.canvas.width + pixel;
                    const distance = Math.pow(i, 2) + Math.pow(j, 2);
                    if (pixelPosition >= 0 && pixelPosition < this.defaultImageArray.length && distance <= Math.pow(this.radius, 2)) {
                        this.changeColor(pixelPosition, [0, 0, 0]);
                    }
                }
            }
        }
    }

    // private detectGroup() {
    //     while (this.initialDifferentPixels.length > 0) {
    //         const pixel = this.initialDifferentPixels.pop();
    //         if (!pixel) {
    //             return;
    //         }
    //         if (!this.visited[pixel]) {
    //             this.visited[pixel] = true;
    //             for (let i = 0; i < 9; i++) {
    //                 const x = (i % 3) - 1;
    //                 const y = Math.floor(i / 3) - 1;
    //             }
    //         }
    //     }
    // }

    private changeColor(pixelPosition: number, color: number[]) {
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

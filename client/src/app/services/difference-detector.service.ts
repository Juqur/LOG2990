import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DifferenceDetectorService {
    firstImageData: Uint8ClampedArray;
    secondImageData: Uint8ClampedArray;
    differenceImageData: Uint8ClampedArray;
    initialDifferentPixels: number[] = [];
    radius: number;
    visited: boolean[] = [];
    differences: number = 0;

    detectDifferences(defaultImage: CanvasRenderingContext2D, secondImage: CanvasRenderingContext2D, radius: string) {
        const radiusNumber = Number(radius);
        if (radiusNumber <= 0) {
            return;
        }
        const defaultImageData = defaultImage.getImageData(0, 0, defaultImage.canvas.width, defaultImage.canvas.height);
        const secondImageData = secondImage.getImageData(0, 0, secondImage.canvas.width, secondImage.canvas.height);
        const differenceData = defaultImage.createImageData(defaultImage.canvas.width, defaultImage.canvas.height);
        this.firstImageData = defaultImageData.data;
        this.secondImageData = secondImageData.data;
        this.differenceImageData = differenceData.data;
        this.radius = radiusNumber;

        // r,g,b,a
        this.detectDifferentPixels();
        this.radiusImplementor(defaultImage);
        const differenceCanvas = document.createElement('canvas').getContext('2d');
        if (!differenceCanvas) {
            return;
        }
        differenceCanvas.canvas.width = defaultImage.canvas.width;
        differenceCanvas.canvas.height = defaultImage.canvas.width;
        differenceCanvas.putImageData(differenceData, 0, 0);
        document.body.appendChild(differenceCanvas.canvas);
    }

    detectDifferentPixels() {
        for (let i = 0; i < this.firstImageData.length; i += 4) {
            const r = this.firstImageData[i];
            const g = this.firstImageData[i + 1];
            const b = this.firstImageData[i + 2];
            const r2 = this.secondImageData[i];
            const g2 = this.secondImageData[i + 1];
            const b2 = this.secondImageData[i + 2];
            if (r - r2 > 0 || g - g2 > 0 || b - b2 > 0) {
                if (i >= 0 && i < this.firstImageData.length) {
                    this.changeColor(i, [0, 0, 0]);
                    this.initialDifferentPixels.push(i);
                }
            } else {
                this.changeColor(i, [255, 255, 255]);
            }
        }
    }
    radiusImplementor(defaultImage: CanvasRenderingContext2D) {
        for (const pixel of this.initialDifferentPixels) {
            for (let i = -this.radius; i < this.radius; i++) {
                for (let j = -this.radius; j < this.radius; j++) {
                    const pixelPosition = i * 4 + j * 4 * defaultImage.canvas.width + pixel;
                    const distance = Math.pow(i, 2) + Math.pow(j, 2);
                    if (pixelPosition >= 0 && pixelPosition < this.firstImageData.length && distance <= Math.pow(this.radius, 2)) {
                        this.changeColor(pixelPosition, [0, 0, 0]);
                    }
                }
            }
        }
    }

    detectGroup() {
        while (this.initialDifferentPixels.length > 0) {
            const pixel = this.initialDifferentPixels.pop();
            if (!pixel) {
                return;
            }
            if (!this.visited[pixel]) {
                this.visited[pixel] = true;
                for (let i = 0; i < 9; i++) {
                    const x = (i % 3) - 1;
                    const y = Math.floor(i / 3) - 1;
                }
            }
        }
    }

    changeColor(pixelPosition: number, color: number[]) {
        this.differenceImageData[pixelPosition] = color[0];
        this.differenceImageData[pixelPosition + 1] = color[1];
        this.differenceImageData[pixelPosition + 2] = color[2];
        this.differenceImageData[pixelPosition + 3] = 255;
    }
}

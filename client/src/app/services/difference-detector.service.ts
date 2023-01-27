import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DifferenceDetectorService {
    differentDectection(defaultImage: CanvasRenderingContext2D, secondImage: CanvasRenderingContext2D, radius: string) {
        const radiusNumber = Number(radius);
        if (radiusNumber <= 0) {
            return;
        }
        const defaultImageData = defaultImage.getImageData(0, 0, defaultImage.canvas.width, defaultImage.canvas.height);
        const secondImageData = secondImage.getImageData(0, 0, secondImage.canvas.width, secondImage.canvas.height);
        const differenceImageData = defaultImage.createImageData(defaultImage.canvas.width, defaultImage.canvas.height);
        const defaultData = defaultImageData.data;
        const secondData = secondImageData.data;
        const differenceData = differenceImageData.data;

        // r,g,b,a

        for (let i = 0; i < defaultData.length; i += 4) {
            const r = defaultData[i];
            const g = defaultData[i + 1];
            const b = defaultData[i + 2];
            const r2 = secondData[i];
            const g2 = secondData[i + 1];
            const b2 = secondData[i + 2];
            if (r - r2 > 0 || g - g2 > 0 || b - b2 > 0) {
                for (let j = -radiusNumber; j < radiusNumber; j++) {
                    for (let k = -radiusNumber; k < radiusNumber; k++) {
                        const pixelPosition = j * 4 + k * 4 * defaultImage.canvas.width + i;
                        if (pixelPosition >= 0 && pixelPosition < defaultData.length && Math.pow(j, 2) + Math.pow(k, 2) < Math.pow(radiusNumber, 2)) {
                            differenceData[pixelPosition] = 0;
                            differenceData[pixelPosition + 1] = 0;
                            differenceData[pixelPosition + 2] = 0;
                            differenceData[pixelPosition + 3] = 255;
                            if (j === 0 && k === 0) {
                                differenceData[pixelPosition] = 255;
                                differenceData[pixelPosition + 1] = 0;
                                differenceData[pixelPosition + 2] = 0;
                                differenceData[pixelPosition + 3] = 255;
                            }
                        }
                    }
                }
            } else {
                differenceData[i + 3] = 0;
            }
        }
        const differenceCanvas = document.createElement('canvas').getContext('2d');
        if (!differenceCanvas) {
            return;
        }
        differenceCanvas.canvas.width = defaultImage.canvas.width;
        differenceCanvas.canvas.height = defaultImage.canvas.width;
        differenceCanvas.putImageData(differenceImageData, 0, 0);
        document.body.appendChild(differenceCanvas.canvas);
    }
}

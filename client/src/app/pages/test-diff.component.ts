import { Component } from '@angular/core';
import { DifferenceDetectorService } from '../services/difference-detector.service';

@Component({
    selector: 'app-test-diff',
    templateUrl: './test-diff.component.html',
    styleUrls: ['./test-diff.component.scss'],
})
export class TestDiffComponent {
    defaultImage: File | null = null;
    diffImage: File | null = null;
    radius = 3;
    constructor(private differenceDetectorService: DifferenceDetectorService) {}

    defaultImageSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.defaultImage = target.files[0];
    }
    diffImageSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.diffImage = target.files[0];
    }
    detectDifference() {
        if (!this.defaultImage || !this.diffImage) {
            return;
        }
        const defaultCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const modifiedCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        document.body.appendChild(defaultCanvas.canvas);
        document.body.appendChild(modifiedCanvas.canvas);
        const image1 = new Image();
        const image2 = new Image();
        image1.src = URL.createObjectURL(this.defaultImage);
        image2.src = URL.createObjectURL(this.diffImage);
        image1.onload = () => {
            image2.onload = () => {
                defaultCanvas.canvas.width = image1.width;
                defaultCanvas.canvas.height = image1.height;
                modifiedCanvas.canvas.width = image1.width;
                modifiedCanvas.canvas.height = image1.height;
                defaultCanvas.drawImage(image1, 0, 0);
                modifiedCanvas.drawImage(image2, 0, 0);
                this.differenceDetectorService.detectDifferences(defaultCanvas, modifiedCanvas, this.radius.toString());
            };
        };
    }
}

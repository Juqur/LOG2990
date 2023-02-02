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
        const defaultCanvas = document.createElement('canvas').getContext('2d');
        const diffCanvas = document.createElement('canvas').getContext('2d');
        document.body.appendChild(defaultCanvas?.canvas as HTMLCanvasElement);
        document.body.appendChild(diffCanvas?.canvas as HTMLCanvasElement);
        const image1 = new Image();
        const image2 = new Image();
        image1.src = URL.createObjectURL(this.defaultImage);
        image2.src = URL.createObjectURL(this.diffImage);
        image1.onload = () => {
            image2.onload = () => {
                if (!defaultCanvas || !diffCanvas) {
                    return;
                }
                defaultCanvas.canvas.width = image1.width;
                defaultCanvas.canvas.height = image1.height;
                diffCanvas.canvas.width = image1.width;
                diffCanvas.canvas.height = image1.height;
                defaultCanvas?.drawImage(image1, 0, 0);
                diffCanvas?.drawImage(image2, 0, 0);
                this.differenceDetectorService.detectDifferences(defaultCanvas, diffCanvas, this.radius.toString());
            };
        };
    }
}

import { Component, OnInit } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { DrawService } from '@app/services/draw.service';
import { Area } from '@app/area';
// import { FlashDifferenceService } from '@app/services/flash-difference.service';
import { MouseService } from '@app/services/mouse.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    constructor(
        // private flash: FlashDifferenceService,
        private canvasShare: CanvasSharingService,
        private mouseService: MouseService, // private drawService: DrawService,
    ) {}

    area = [...Area];

    defaultImage: File | null = null;
    diffImage: File | null = null;
    originalPlayArea: PlayAreaComponent;
    diffPlayArea: PlayAreaComponent;
    originalCanvasCtx: CanvasRenderingContext2D | null = null;
    diffCanvasCtx: CanvasRenderingContext2D | null = null;

    url: unknown;
    msg = '';

    ngOnInit(): void {
        this.originalCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.setDefaultCanvasRef(this.originalCanvasCtx?.canvas as HTMLCanvasElement);
        this.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.setDiffCanvasRef(this.diffCanvasCtx?.canvas as HTMLCanvasElement);

        this.originalPlayArea = new PlayAreaComponent(new DrawService(), this.canvasShare, this.mouseService);
        this.diffPlayArea = new PlayAreaComponent(new DrawService(), this.canvasShare, this.mouseService);
    }
    /**
     * The function in charge of receiving the click event.
     * It is also the function in charge of giving the player a penality
     * if he click on a pixel that wasn't a difference.
     *
     * @param event the mouse click event on the canvas we want to process.
     */
    mouseHitDetect(event: MouseEvent) {
        console.log('mouse hit detect');
    }

    clickedOnOriginal(event: MouseEvent) {
        console.log('clicked on original');
        if (!this.diffCanvasCtx) {
            return;
        }
        let rgba = this.pick(this.mouseService.getX(), this.mouseService.getY());
        console.log(rgba);

        // this.diffCanvasCtx.fillStyle = rgba;
        // this.diffCanvasCtx.fillRect(0, 0, 100, 100);
    }

    clickedOnDiff(event: MouseEvent) {
        console.log('clicked on diff');
        // this.showOriginalImage();
        console.log(this.area[0]);
        // this.highlightArea(this.area);

        let rgba = this.pick(this.mouseService.getX(), this.mouseService.getY());
        if (!this.originalCanvasCtx) {
            return;
        }
        let context = this.canvasShare.diffCanvasRef.getContext('2d');
        if (!context) {
            return;
        }
        context.fillStyle = rgba;
        context.fillRect(this.mouseService.getX(), this.mouseService.getY(), 100, 100);
    }

    pick(x: number, y: number): string {
        const pixel = this.canvasShare.defaultCanvasRef.getContext('2d')?.getImageData(x, y, 1, 1);
        console.log(pixel);
        if (!pixel) {
            console.log('no pixel');
            return 'white';
        }
        const data = pixel.data;

        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
        console.log(rgba);
        return rgba;
    }

    colorPixel(x: number, y: number, color: string) {
        if (!this.originalCanvasCtx) {
            return;
        }
        this.originalCanvasCtx.fillStyle = color;
        this.originalCanvasCtx.fillRect(x, y, 1, 1);
    }

    highlightArea(area: number[]) {
        let x: number = 0;
        let y: number = 0;
        area.forEach((pixelData) => {
            x = (pixelData % 640) / 4;
            y = Math.floor(pixelData / 640 / 4);
        });
        let rgba = this.pick(x, y);
        let context = this.canvasShare.diffCanvasRef.getContext('2d');
        if (!context) {
            return;
        }
        context.fillStyle = rgba;
        context.fillRect(x, y, 1, 1);
    }
}

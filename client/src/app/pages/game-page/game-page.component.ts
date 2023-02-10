import { Component, OnInit } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { DrawService } from '@app/services/draw.service';
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
        let rgba = this.pick(this.mouseService);
        console.log(rgba);

        this.diffCanvasCtx.fillStyle = rgba;
        this.diffCanvasCtx.fillRect(0, 0, 100, 100);
        // let context = this.canvasShare.diffCanvasRef.getContext('2d');
        // let color = this.pick(event, context);
        // context?.fillStyle = 'red';
        // context?.fillRect(0, 0, 100, 100);
    }

    clickedOnDiff(event: MouseEvent) {
        console.log('clicked on diff');
        // this.showOriginalImage();
        let rgba = this.pick(this.mouseService);
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

    pick(mouseService: MouseService): string {
        console.log(mouseService.getX());
        console.log(mouseService.getY());
        const pixel = this.canvasShare.defaultCanvasRef.getContext('2d')?.getImageData(mouseService.getX(), mouseService.getY(), 1, 1);
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
}

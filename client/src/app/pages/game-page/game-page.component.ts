import { Component, OnInit } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { DrawService } from '@app/services/draw.service';
import { Area } from '@app/area';
// import { FlashDifferenceService } from '@app/services/flash-difference.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    constructor(private canvasShare: CanvasSharingService, private mouseService: MouseService, private drawService: DrawService) {}

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

    clickedOnOriginal(event: MouseEvent) {
        console.log('clicked on original');
        if (!this.diffCanvasCtx) {
            return;
        }

        if (this.mouseService.mouseHitDetect(event)) {
            this.originalPlayArea.flashArea2(this.area[0].area, this.canvasShare.defaultCanvasRef);
            // this.originalPlayArea.setCanvas(this.canvasShare.defaultCanvasRef);
            // this.originalPlayArea.flashArea(this.area[0].area);
            // // this.flashArea(this.area[0].area, this.canvasShare.defaultCanvasRef);
            this.originalPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
                this.originalPlayArea.drawPlayArea2('../../../assets/un_regal.bmp', this.canvasShare.defaultCanvasRef);
                console.log('timeout');
            });
        }
    }

    clickedOnDiff(event: MouseEvent) {
        console.log('clicked on diff');

        // this.flashArea(this.area[0].area, this.canvasShare.diffCanvasRef);
        if (this.mouseService.mouseHitDetect(event)) {
            // this.drawService.drawError(this.mouseService);
            this.drawService.drawError2(this.mouseService, this.canvasShare.diffCanvasRef);
            this.mouseService.changeClickState();
            this.diffPlayArea.flashArea2(this.area[0].area, this.canvasShare.diffCanvasRef);
            this.diffPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
                // this.diffPlayArea.drawPlayArea2('../../../assets/test/image_7_diff.bmp', this.canvasShare.diffCanvasRef);
                console.log('timeout');
                this.copyArea(this.area[0].area);
            });
        }
    }

    pick(x: number, y: number): string {
        const pixel = this.canvasShare.defaultCanvasRef.getContext('2d')?.getImageData(x, y, 1, 1);
        // console.log(pixel);
        if (!pixel) {
            console.log('no pixel');
            return 'white';
        }
        const data = pixel.data;

        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
        // console.log(rgba);
        return rgba;
    }

    copyArea(area: number[]) {
        let x: number = 0;
        let y: number = 0;
        area.forEach((pixelData) => {
            x = (pixelData % 640) / 4;
            y = Math.floor(pixelData / 640 / 4);

            let rgba = this.pick(x, y);
            let context = this.canvasShare.diffCanvasRef.getContext('2d');
            if (!context) {
                return;
            }

            context.fillStyle = rgba;
            context.fillRect(x, y, 1, 1);
        });
    }

    flashArea(area: number[], canvas: HTMLCanvasElement) {
        let x: number = 0;
        let y: number = 0;
        area.forEach((pixelData) => {
            x = (pixelData % 640) / 4;
            y = Math.floor(pixelData / 640 / 4);

            let context = canvas.getContext('2d');
            if (!context) {
                return;
            }

            context.fillStyle = 'red';
            context.fillRect(x, y, 1, 1);
        });
    }
}

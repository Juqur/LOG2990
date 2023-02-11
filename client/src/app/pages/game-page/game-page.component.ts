import { Component, OnInit, ViewChild } from '@angular/core';
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
    constructor(
        private canvasShare: CanvasSharingService,
        private mouseService: MouseService,
        private readonly drawServiceDiff: DrawService,
        private readonly drawServiceOriginal: DrawService,
    ) {}
    @ViewChild('originalPlayArea', { static: false }) private originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) private diffPlayArea!: PlayAreaComponent;

    area = [...Area];

    defaultImage: File | null = null;
    diffImage: File | null = null;
    // originalPlayArea: PlayAreaComponent;
    // diffPlayArea: PlayAreaComponent;
    originalCanvasCtx: CanvasRenderingContext2D | null = null;
    diffCanvasCtx: CanvasRenderingContext2D | null = null;

    url: unknown;
    msg = '';

    ngOnInit(): void {
        this.originalCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.setDefaultCanvasRef(this.originalCanvasCtx?.canvas as HTMLCanvasElement);
        this.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.setDiffCanvasRef(this.diffCanvasCtx?.canvas as HTMLCanvasElement);
    }

    clickedOnOriginal(event: MouseEvent) {
        console.log('clicked on original');
        if (this.mouseService.mouseHitDetect(event)) {
            this.originalPlayArea.flashArea(this.area[0].area);
            this.originalPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
                this.originalPlayArea.drawPlayArea('../../../assets/un_regal.bmp');
            });
        } else {
            this.drawServiceOriginal.context = this.originalPlayArea.getCanvas().nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.drawServiceOriginal.drawError(this.mouseService);
            this.originalPlayArea
                .timeout(Constants.millisecondsInOneSecond)
                .then(() => {})
                .then(() => {
                    this.originalPlayArea.drawPlayArea('../../../assets/un_regal.bmp');
                });
        }
    }

    clickedOnDiff(event: MouseEvent) {
        console.log('clicked on diff');

        if (this.mouseService.mouseHitDetect(event)) {
            this.diffPlayArea.flashArea(this.area[0].area);
            this.diffPlayArea
                .timeout(Constants.millisecondsInOneSecond)
                .then(() => {})
                .then(() => {
                    this.copyArea(this.area[0].area);
                });
        } else {
            this.drawServiceDiff.context = this.diffPlayArea.getCanvas().nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.drawServiceDiff.drawError(this.mouseService);
            this.diffPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
                this.diffPlayArea.drawPlayArea('../../../assets/test/image_7_diff.bmp');
            });
            // this.diffPlayArea
            //     .timeout(Constants.millisecondsInOneSecond)
            //     .then(() => {})
            //     .then(() => {
            //         this.copyArea(this.area[0].area);
            //     });
            // .then(() => {
            //     this.diffPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
            //         this.copyArea(this.area[0].area);
            //     });
            // });
        }
    }

    pick(x: number, y: number): string {
        const pixel = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true })?.getImageData(x, y, 1, 1);
        // console.log(pixel);
        if (!pixel) {
            console.log('no pixel');
            return 'white';
        }
        const data = pixel.data;

        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
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

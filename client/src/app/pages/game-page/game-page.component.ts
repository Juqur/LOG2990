import { Component, ViewChild, OnInit } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/draw.service';
// import { FlashDifferenceService } from '@app/services/flash-difference.service';
import { area } from '@app/area';
import { MouseService } from '@app/services/mouse.service';
import { ActivatedRoute } from '@angular/router';
import { Level } from '@app/levels';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    @ViewChild('originalPlayArea', { static: false }) private originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) private diffPlayArea!: PlayAreaComponent;

    area = [...area];

    originalImage: string = '../../../assets/un_regal.bmp';
    diffImage: string = '../../../assets/test/image_7_diff.bmp';
    diffCanvasCtx: CanvasRenderingContext2D | null = null;

    levelId: number;
    currentLevel: Level; // doit recuperer du server
    isClassicGamemode: boolean = true;
    isMultiplayer: boolean = false;
    nbDiff: number = Constants.INIT_DIFF_NB; // Il faudrait avoir cette info dans le level
    hintPenalty = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    imagesData: unknown[] = [];
    defaultImgSrc = '';
    diffImgSrc = '';
    defaultArea: boolean = true;
    diffArea: boolean = true;
    foundADifference = false;

    constructor(
        // private canvasShare: CanvasSharingService,
        private mouseService: MouseService,
        private readonly drawServiceDiff: DrawService,
        private readonly drawServiceOriginal: DrawService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            // recoit le bon id!!
            this.levelId = params.id;
        });
    }

    async clickedOnOriginal(event: MouseEvent) {
        if (this.mouseService.getCanClick()) {
            const diffDetected = this.mouseService.mouseHitDetect(event, this.area[0].area);
            if (diffDetected) {
                this.copyArea(this.area[0].area);
                this.originalPlayArea.flashArea(this.area[0].area);
                this.mouseService.changeClickState();
                this.originalPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.originalPlayArea.drawPlayArea(this.originalImage);
                    this.mouseService.changeClickState();
                });
                this.foundADifference = true;
            } else {
                this.drawServiceOriginal.context = this.originalPlayArea
                    .getCanvas()
                    .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
                this.drawServiceOriginal.drawError(this.mouseService);
                this.mouseService.changeClickState();
                this.originalPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.mouseService.changeClickState();
                    this.originalPlayArea.drawPlayArea(this.originalImage);
                });
            }
        }
    }

    async clickedOnDiff(event: MouseEvent) {
        const myPromise = new Promise((resolve) => {
            // Do some asynchronous work
            setTimeout(() => {
                resolve('Async operation completed successfully!');
            }, Constants.millisecondsInOneSecond);
        });

        if (this.mouseService.getCanClick()) {
            const diffDetected = this.mouseService.mouseHitDetect(event, this.area[0].area);
            if (diffDetected) {
                this.mouseService.changeClickState();
                this.diffPlayArea.flashArea(this.area[0].area);
                this.diffPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.mouseService.changeClickState();
                    this.copyArea(this.area[0].area);
                });
                this.foundADifference = true;
            } else {
                this.mouseService.changeClickState();
                this.drawServiceDiff.context = this.diffPlayArea
                    .getCanvas()
                    .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
                this.drawServiceDiff.drawError(this.mouseService);

                myPromise
                    .then(() => {
                        this.diffPlayArea.drawPlayArea(this.diffImage);
                    })
                    .then(() => {
                        setTimeout(() => {
                            if (this.foundADifference) {
                                this.mouseService.changeClickState();
                                this.copyArea(this.area[0].area);
                            }
                        }, Constants.twenty);
                    });
            }
        }
    }

    pick(x: number, y: number): string {
        const pixel = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true })?.getImageData(x, y, 1, 1);
        if (!pixel) {
            return 'white';
        }
        const data = pixel.data;

        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / Constants.FULL_ALPHA})`;
        return rgba;
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    copyArea(area: number[]) {
        let x = 0;
        let y = 0;
        area.forEach((pixelData) => {
            x = (pixelData % this.originalPlayArea.width) / Constants.PIXEL_SIZE;
            y = Math.floor(pixelData / this.originalPlayArea.width / Constants.PIXEL_SIZE);

            const rgba = this.pick(x, y);
            const context = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true });
            if (!context) {
                return;
            }

            context.fillStyle = rgba;
            context.fillRect(x, y, 1, 1);
        });
    }
}

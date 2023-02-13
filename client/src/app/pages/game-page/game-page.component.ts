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

    originalImageSrc: string = '';
    diffImageSrc: string = '';
    diffCanvasCtx: CanvasRenderingContext2D | null = null;

    levelId: number;
    currentLevel: Level; // doit recuperer du server
    isClassicGamemode: boolean = true;
    isMultiplayer: boolean = false;
    nbDiff: number = Constants.INIT_DIFF_NB; // Il faudrait avoir cette info dans le level
    hintPenalty = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    imagesData: unknown[] = [];
    // defaultImgSrc = '';
    // diffImgSrc = '';
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
        try {
            console.log(this.levelId);
            this.originalImageSrc = 'http://localhost:3000/originals/' + this.levelId + '.bmp';
            this.diffImageSrc = 'http://localhost:3000/modifiees/' + this.levelId + '.bmp';
        } catch (error) {
            console.log(error);
        }
    }

    clickedOnOriginal(event: MouseEvent) {
        if (this.mouseService.getCanClick()) {
            const diffDetected = this.mouseService.mouseHitDetect(event, this.area[0].area);
            if (diffDetected) {
                this.copyArea(this.area[0].area);
                this.originalPlayArea.flashArea(this.area[0].area);
                this.mouseService.changeClickState();
                this.originalPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.originalPlayArea.drawPlayArea(this.originalImageSrc);
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
                    this.originalPlayArea.drawPlayArea(this.originalImageSrc);
                });
            }
        }
    }

    clickedOnDiff(event: MouseEvent) {
        const myPromise = new Promise((resolve) => {
            // Do some asynchronous work
            setTimeout(() => {
                resolve('Async operation completed successfully!');
            }, Constants.millisecondsInOneSecond);
        });

        if (this.mouseService.getCanClick()) {
            const diffDetected = this.mouseService.mouseHitDetect(event, []);
            if (diffDetected) {
                // console.log('found a difference');
                this.mouseService.changeClickState();
                // this.diffPlayArea.flashArea(this.area[0].area);
                myPromise.then(() => {
                    setTimeout(() => {
                        if (this.foundADifference) {
                            console.log('here');
                            this.mouseService.changeClickState();
                            this.copyArea(this.area[0].area);
                        }
                    }, Constants.twenty);
                });
                this.foundADifference = true;
            } else {
                console.log('did not find a difference');
                this.mouseService.changeClickState();
                this.drawServiceDiff.context = this.diffPlayArea
                    .getCanvas()
                    .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
                this.drawServiceDiff.drawError(this.mouseService);

                myPromise
                    .then(() => {
                        this.diffPlayArea.drawPlayArea(this.diffImageSrc);
                    })
                    .then(() => {
                        setTimeout(() => {
                            this.mouseService.changeClickState();
                            if (this.foundADifference) {
                                this.copyArea(this.area[0].area);
                            }
                        }, Constants.twenty);
                    });
            }
        }
    }

    pick(x: number, y: number): string {
        const context = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        // const pixel = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true })?.getImageData(x, y, 1, 1);
        const pixel = context.getImageData(x, y, 1, 1);
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
        const context = this.diffPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        area.forEach((pixelData) => {
            x = (pixelData % this.originalPlayArea.width) / Constants.PIXEL_SIZE;
            y = Math.floor(pixelData / this.originalPlayArea.width / Constants.PIXEL_SIZE);

            const rgba = this.pick(x, y);
            if (!context) {
                return;
            }

            context.fillStyle = rgba;
            context.fillRect(x, y, 1, 1);
        });
    }
}

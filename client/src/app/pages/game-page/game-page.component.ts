import { Component, OnInit, ViewChild } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/draw.service';
import { ActivatedRoute } from '@angular/router';
import { area } from '@app/area';
import { Level } from '@app/levels';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    providers: [DrawService],
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
    imagesData: number[] = [];
    defaultArea: boolean = true;
    diffArea: boolean = true;
    foundADifference = false;

    drawServiceDiff: DrawService = new DrawService();
    drawServiceOriginal: DrawService = new DrawService();

    constructor(private mouseService: MouseService, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            // recoit le bon id!!
            this.levelId = params.id;
        });
        try {
            this.originalImageSrc = 'http://localhost:3000/originals/' + this.levelId + '.bmp';
            this.diffImageSrc = 'http://localhost:3000/modifiees/' + this.levelId + '.bmp';
        } catch (error) {
            throw new Error("Couldn't load images");
        }
    }

    clickedOnOriginal(event: MouseEvent) {
        if (this.mouseService.getCanClick()) {
            const diffDetected = this.mouseService.mouseHitDetect(event);
            diffDetected.then((result) => {
                if (result.length > 0) {
                    this.imagesData.concat(result);
                    this.copyArea(result);
                    this.originalPlayArea.flashArea(result);
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
            });
        }
    }

    clickedOnDiff(event: MouseEvent) {
        if (this.mouseService.getCanClick()) {
            const diffDetected = this.mouseService.mouseHitDetect(event);
            diffDetected.then((result) => {
                if (result.length > 0) {
                    this.imagesData.push(...result);
                    console.log(result);
                    this.diffPlayArea.flashArea(result);
                    this.mouseService.changeClickState();
                    this.diffPlayArea
                        .timeout(Constants.millisecondsInOneSecond)
                        .then(() => {
                            this.diffPlayArea.drawPlayArea(this.diffImageSrc);
                            this.mouseService.changeClickState();
                        })
                        .then(() => {
                            setTimeout(() => {
                                this.copyArea(this.imagesData);
                                console.log(this.imagesData);
                            }, Constants.thirty);
                        });
                    this.foundADifference = true;
                } else {
                    this.drawServiceDiff.context = this.diffPlayArea
                        .getCanvas()
                        .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
                    this.drawServiceDiff.drawError(this.mouseService);
                    this.mouseService.changeClickState();
                    this.diffPlayArea
                        .timeout(Constants.millisecondsInOneSecond)
                        .then(() => {
                            this.mouseService.changeClickState();
                            this.diffPlayArea.drawPlayArea(this.diffImageSrc);
                        })
                        .then(() => {
                            setTimeout(() => {
                                this.copyArea(this.imagesData);
                                console.log(this.imagesData);
                            }, Constants.thirty);
                        });
                }
            });
        }
    }

    pick(x: number, y: number): string {
        const context = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
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
            x = (pixelData / Constants.PIXEL_SIZE) % this.originalPlayArea.width;
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

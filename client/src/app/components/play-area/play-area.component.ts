import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    providers: [DrawService],
})
export class PlayAreaComponent implements AfterViewInit {
    @Input() image: string = './assets/un_regal.bmp';
    @ViewChild('gridCanvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;

    buttonPressed = '';

    private canvasSize = { x: Constants.DEFAULT_WIDTH, y: Constants.DEFAULT_HEIGHT };
    constructor(private readonly drawService: DrawService, private readonly mouseService: MouseService) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    ngAfterViewInit(): void {
        this.drawPlayArea();
    }

    /**
     * The function in charge of receiving the click event.
     * It is also the function in charge of giving the player a penality
     * if he click on a pixel that wasn't a difference.
     *
     * @param event the mouse click event on the canvas we want to process.
     */
    mouseHitDetect(event: MouseEvent) {
        if (this.mouseService.getCanClick()) {
            if (this.mouseService.mouseHitDetect(event)) {
                // this.drawService.drawSuccess(this.mouseService);
                this.drawService.drawHighlight(this.mouseService);
                this.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.drawPlayArea();
                });
            } else {
                this.drawService.drawError(this.mouseService);
                this.mouseService.changeClickState();
                this.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.mouseService.changeClickState();
                    this.drawPlayArea();
                });
            }
        }
    }

    /**
     * The function in charge of loading the image on the canvas.
     * It is also used to reload the image and erase any text or modifications we may
     * have added to it.
     */
    drawPlayArea() {
        this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const ctx = this.drawService.context;
        const currentImage = new Image();
        currentImage.src = this.image;
        currentImage.onload = () => {
            ctx.drawImage(currentImage, 0, 0, this.width, this.height);
        };
        this.canvas.nativeElement.focus();
    }

    async timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

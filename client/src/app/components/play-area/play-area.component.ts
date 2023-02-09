import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
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
    @Input() isDiff: boolean;
    @Input() image: string;
    @ViewChild('gridCanvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;

    buttonPressed = '';

    private canvasSize = { x: Constants.DEFAULT_WIDTH, y: Constants.DEFAULT_HEIGHT };
    constructor(
        private readonly drawService: DrawService,
        private canvasSharing: CanvasSharingService,
        private readonly mouseService: MouseService,
    ) {}

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
        this.drawPlayArea(this.image);
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
                this.drawService.drawSuccess(this.mouseService);
                this.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.drawService.refreshCanvas(this.image);
                });
            } else {
                this.drawService.drawError(this.mouseService);
                this.mouseService.changeClickState();
                this.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.mouseService.changeClickState();
                    this.drawService.refreshCanvas(this.image);
                });
            }
        }
    }

    /**
     * The function in charge of loading the image on the canvas.
     * It is also used to reload the image and erase any text or modifications we may
     * have added to it.
     */
    drawPlayArea(image: string) {
        if (this.canvas) {
            this.canvas.nativeElement.id = this.isDiff ? 'diffCanvas0' : 'defaultCanvas0';
            if (!this.isDiff) {
                // Default canvas (left canvas)
                this.canvasSharing.setDefaultCanvasRef(this.canvas.nativeElement);
                this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            } else {
                // Diff canvas (right canvas)
                this.canvasSharing.setDiffCanvasRef(this.canvas.nativeElement);
                this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            }
            // this.canvas.nativeElement.style.backgroundColor = 'white';
            // this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            const ctx = this.drawService.context;
            const currentImage = new Image();
            currentImage.src = image;
            currentImage.onload = () => {
                ctx.drawImage(currentImage, 0, 0, this.width, this.height);
            };
            this.canvas.nativeElement.focus();
        }
    }

    async timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

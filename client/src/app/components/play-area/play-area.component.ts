import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { DrawService } from '@app/services/draw.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    providers: [DrawService],
})
export class PlayAreaComponent implements AfterViewInit {
    @Input() isDiff: boolean;
    @Input() image: string = '';
    @ViewChild('gridCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

    buttonPressed = '';

    private canvasSize = { x: Constants.DEFAULT_WIDTH, y: Constants.DEFAULT_HEIGHT };
    constructor(
        private readonly drawService: DrawService,
        private canvasSharing: CanvasSharingService, // private readonly mouseService: MouseService,
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

    getCanvas() {
        return this.canvas;
    }

    /**
     * The function in charge of loading the image on the canvas.
     * It is also used to reload the image and erase any text or modifications we may
     * have added to it.
     */
    drawPlayArea(image: string) {
        if (this.canvas) {
            this.canvas.nativeElement.id = this.isDiff ? 'diffCanvas0' : 'defaultCanvas0';
            const context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            if (!this.isDiff) {
                // Default canvas (left canvas)
                this.canvasSharing.setDefaultCanvasRef(this.canvas.nativeElement);
                this.drawService.context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            } else {
                // Diff canvas (right canvas)
                this.canvasSharing.setDiffCanvasRef(this.canvas.nativeElement);
                this.drawService.context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            }
            const currentImage = new Image();
            currentImage.crossOrigin = 'anonymous';
            currentImage.src = image;
            currentImage.onload = () => {
                context.drawImage(currentImage, 0, 0, this.width, this.height);
            };
            this.canvas.nativeElement.style.backgroundColor = 'white';
            this.canvas.nativeElement.focus();
        }
    }

    /**
     * flash the area of the canvas red
     *
     * @param area the area to flash
     */
    // eslint-disable-next-line @typescript-eslint/no-shadow
    flashArea(area: number[]) {
        let x = 0;
        let y = 0;
        const context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        if (!context) {
            return;
        }
        area.forEach((pixelData) => {
            x = (pixelData / Constants.PIXEL_SIZE) % this.width;
            y = Math.floor(pixelData / this.width / Constants.PIXEL_SIZE);

            context.fillStyle = 'red';
            context.fillRect(x, y, 1, 1);
        });
    }

    /**
     * timeout function
     *
     * @param ms a number of milliseconds
     * @returns a promise that resolves after ms milliseconds
     */
    async timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

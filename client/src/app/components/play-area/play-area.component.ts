import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { CanvasSharingService } from '@app/services/canvas-sharing/canvas-sharing.service';
import { DrawService } from '@app/services/draw/draw.service';
import { Constants } from '@common/constants';

/**
 * This component represents one of the two canvas inside a game page.
 *
 * @author Simon Gagné & Galen Hu & Charles Degrandpré
 * @class PlayAreaComponent
 */
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
    currentImage: HTMLImageElement;

    buttonPressed = '';
    private tempCanvas: HTMLCanvasElement;
    private canvasSize = { x: Constants.DEFAULT_WIDTH, y: Constants.DEFAULT_HEIGHT };
    constructor(private readonly drawService: DrawService, private canvasSharing: CanvasSharingService) {}

    /**
     * Getter for the canvas width
     */
    get width(): number {
        return this.canvasSize.x;
    }

    /**
     * Getter for the canvas height
     */
    get height(): number {
        return this.canvasSize.y;
    }

    /**
     * This method listens for key presses and updates the buttonPressed attribute in
     * consequences.
     *
     * @param event the keyboardEvent to process.
     */
    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent): void {
        this.buttonPressed = event.key;
    }

    /**
     * Method called after the initial rendering.
     */
    ngAfterViewInit(): void {
        this.drawPlayArea(this.image);
    }

    /**
     * Returns the canvas element.
     */
    getCanvas(): ElementRef<HTMLCanvasElement> {
        return this.canvas;
    }

    /**
     * The function in charge of loading the image on the canvas.
     * It is also used to reload the image and erase any text or modifications we may
     * have added to it.
     *
     * @param image the image source
     */
    drawPlayArea(image: string): void {
        if (this.canvas) {
            this.canvas.nativeElement.id = this.isDiff ? 'diffCanvas0' : 'defaultCanvas0';
            const context = this.getCanvasRenderingContext2D();
            if (!this.isDiff) {
                // Default canvas (left canvas)
                this.canvasSharing.defaultCanvas = this.canvas.nativeElement;
                this.drawService.context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            } else {
                // Diff canvas (right canvas)
                this.canvasSharing.diffCanvas = this.canvas.nativeElement;
                this.drawService.context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            }
            this.currentImage = new Image();
            this.currentImage.crossOrigin = 'anonymous';
            this.currentImage.src = image;
            this.currentImage.onload = () => {
                context.drawImage(this.currentImage, 0, 0, this.width, this.height);
            };
            this.canvas.nativeElement.style.backgroundColor = 'white';
            this.canvas.nativeElement.focus();
        }
    }

    /**
     * Fills a given area of the canvas in red.
     *
     * @param area the area to flash
     */
    flashArea(area: number[]): void {
        let x = 0;
        let y = 0;
        if (this.tempCanvas) this.deleteTempCanvas();
        this.createTempCanvas();
        const context = this.tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        area.forEach((pixelData) => {
            x = (pixelData / Constants.PIXEL_SIZE) % this.width;
            y = Math.floor(pixelData / this.width / Constants.PIXEL_SIZE);
            context.fillStyle = 'red';
            context.fillRect(x, y, 1, 1);
        });
    }

    getFlashingCopy(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.drawImage(this.canvas.nativeElement, 0, 0, this.width, this.height);
        context.drawImage(this.tempCanvas, 0, 0, this.width, this.height);
        return canvas;
    }

    /**
     * Creates a temporary canvas that will be used to flash the differences between the two images.
     * The temporary canvas is over the play canvas and lets click events pass through it.
     */
    createTempCanvas(): void {
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.className = 'temp';
        this.tempCanvas.style.position = 'absolute';
        this.tempCanvas.style.top = this.canvas.nativeElement.offsetTop + 'px';
        this.tempCanvas.style.left = this.canvas.nativeElement.offsetLeft + 'px';
        this.tempCanvas.width = this.width;
        this.tempCanvas.height = this.height;
        this.drawService.context = this.tempCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const currentCanvas = document.body.querySelector('#' + this.canvas.nativeElement.id) as HTMLCanvasElement;
        currentCanvas.after(this.tempCanvas);
        this.tempCanvas.style.pointerEvents = 'none';
    }

    /**
     * Deletes the temporary canvas if it exists.
     */
    deleteTempCanvas(): void {
        if (this.tempCanvas) this.tempCanvas.remove();
    }

    /**
     * This function creates a new timeout with a given time in milliseconds as a parameter.
     *
     * @param ms a number of milliseconds
     * @return promise that resolves after ms milliseconds
     */
    async timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    setContext(context: CanvasRenderingContext2D): void {
        const currentCanvas = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        currentCanvas.clearRect(0, 0, this.width, this.height);
        currentCanvas.drawImage(context.canvas, 0, 0);
    }

    getCanvasRenderingContext2D(): CanvasRenderingContext2D {
        return this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }
}

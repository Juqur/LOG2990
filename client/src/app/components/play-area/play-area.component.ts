import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, ViewChild } from '@angular/core';
import { CanvasSharingService } from '@app/services/canvas-sharing/canvas-sharing.service';
import { DrawService } from '@app/services/draw/draw.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    providers: [DrawService],
})
/**
 * This component represents one of the two canvas inside a game page.
 *
 * @author Simon Gagné & Galen Hu & Charles Degrandpré
 * @class PlayAreaComponent
 */
export class PlayAreaComponent implements AfterViewInit, OnChanges {
    @Input() isDiff: boolean;
    @Input() image: string = '';
    @ViewChild('gridCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
    currentImage: HTMLImageElement;

    buttonPressed = '';

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
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    /**
     * Method called after the initial rendering.
     */
    ngAfterViewInit(): void {
        this.drawPlayArea(this.image);
    }

    /**
     * Method called when the input changes.
     * It is used to reload the image on the canvas.
     */
    ngOnChanges(): void {
        this.drawPlayArea(this.image);
    }

    /**
     * Returns the canvas element.
     */
    getCanvas() {
        return this.canvas;
    }

    /**
     * The function in charge of loading the image on the canvas.
     * It is also used to reload the image and erase any text or modifications we may
     * have added to it.
     *
     * @param image the image source
     */
    drawPlayArea(image: string) {
        if (this.canvas) {
            this.canvas.nativeElement.id = this.isDiff ? 'diffCanvas0' : 'defaultCanvas0';
            const context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
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
     * This function creates a new timeout with a given time in milliseconds as a parameter.
     *
     * @param ms a number of milliseconds
     * @return promise that resolves after ms milliseconds
     */
    async timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

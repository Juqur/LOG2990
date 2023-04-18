import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, ViewChild } from '@angular/core';
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
export class PlayAreaComponent implements AfterViewInit, OnChanges {
    @Input() isDifferenceCanvas: boolean;
    @Input() image: string = '';
    @ViewChild('gridCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
    currentImage: HTMLImageElement;

    buttonPressed = '';
    private tempCanvas: HTMLCanvasElement;
    constructor(private readonly drawService: DrawService, private canvasSharing: CanvasSharingService) {}

    /**
     * Getter for the canvas width
     */
    get width(): number {
        return Constants.DEFAULT_WIDTH;
    }

    /**
     * Getter for the canvas height
     */
    get height(): number {
        return Constants.DEFAULT_HEIGHT;
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
     * Method called when the input changes.
     * It is used to reload the image on the canvas.
     */
    ngOnChanges(): void {
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
     * @param image The image source.
     */
    drawPlayArea(image: string): void {
        if (this.canvas) {
            this.canvas.nativeElement.id = this.isDifferenceCanvas ? 'differenceCanvas' : 'defaultCanvas';
            const context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            if (!this.isDifferenceCanvas) {
                // Default canvas (left canvas)
                this.canvasSharing.defaultCanvas = this.canvas.nativeElement;
                this.drawService.context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            } else {
                // Diff canvas (right canvas)
                this.canvasSharing.differenceCanvas = this.canvas.nativeElement;
                this.drawService.context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            }
            this.currentImage = new Image();
            this.currentImage.crossOrigin = 'anonymous';
            this.currentImage.src = image;
            this.currentImage.onload = async () => {
                context.drawImage(this.currentImage, 0, 0, this.width, this.height);
            };
            this.canvas.nativeElement.style.backgroundColor = 'white';
            this.canvas.nativeElement.focus();
        }
    }

    /**
     * Fills a given area of the canvas in red.
     *
     * @param area The area to flash.
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
     * @param ms The amount of milliseconds.
     * @return A promise that resolves after ms milliseconds.
     */
    async timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Fills a given area of the canvas in red.
     *
     * @param area the area to flash
     */
    showHintSection(section: number[]) {
        const rectangleZone: number[] = [0, 0, 0, 0];
        if (section[1] === Constants.TOP_RIGHT_QUADRANT || section[1] === Constants.BOTTOM_RIGHT_QUADRANT)
            rectangleZone[0] = this.width / Constants.SUBQUADRANT_DIVIDER;
        if (section[1] === Constants.BOTTOM_LEFT_QUADRANT || section[1] === Constants.BOTTOM_RIGHT_QUADRANT)
            rectangleZone[1] = this.height / Constants.SUBQUADRANT_DIVIDER;
        rectangleZone[2] = section[1] ? this.width / Constants.SUBQUADRANT_DIVIDER : this.width / 2;
        rectangleZone[3] = section[1] ? this.height / Constants.SUBQUADRANT_DIVIDER : this.height / 2;
        rectangleZone[0] += section[0] === Constants.TOP_RIGHT_QUADRANT || section[0] === Constants.BOTTOM_RIGHT_QUADRANT ? this.width / 2 : 0;
        rectangleZone[1] += section[0] === Constants.BOTTOM_LEFT_QUADRANT || section[0] === Constants.BOTTOM_RIGHT_QUADRANT ? this.height / 2 : 0;
        if (this.tempCanvas) this.deleteTempCanvas();
        this.createTempCanvas();
        const context = this.tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        context.strokeStyle = 'green';
        context.lineWidth = 5;
        context.beginPath();
        context.rect(rectangleZone[0], rectangleZone[1], rectangleZone[2], rectangleZone[3]);
        context.stroke();
    }
}

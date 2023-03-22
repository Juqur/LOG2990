import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { Constants } from '@common/constants';

/**
 * This component represents one of the two canvas inside a game page.
 *
 * @author Simon Gagné
 * @class PaintAreaComponent
 */

@Component({
    selector: 'app-paint-area',
    templateUrl: './paint-area.component.html',
    styleUrls: ['./paint-area.component.scss'],
    providers: [DrawService],
})
export class PaintAreaComponent implements AfterViewInit {
    @Input() isDiff: boolean;
    @Input() image: string = '';
    @ViewChild('foregroundCanvas', { static: false }) foregroundCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('backgroundCanvas', { static: false }) backgroundCanvas!: ElementRef<HTMLCanvasElement>;
    currentImage: HTMLImageElement;
    isShiftPressed = false;
    isDragging = false;
    private lastMousePosition: Vec2 = { x: -1, y: -1 };
    private tempCanvas: HTMLCanvasElement;

    private canvasSize = { x: Constants.DEFAULT_WIDTH, y: Constants.DEFAULT_HEIGHT };
    constructor(private readonly drawService: DrawService, private canvasSharing: CanvasSharingService, private mouseService: MouseService) {}

    /**
     * Getter for the canvas width.
     */
    get width(): number {
        return this.canvasSize.x;
    }

    /**
     * Getter for the canvas height.
     */
    get height(): number {
        return this.canvasSize.y;
    }

    /**
     * Getter for the foreground canvas.
     */
    get paintCanvas(): HTMLCanvasElement {
        return this.foregroundCanvas.nativeElement;
    }

    /**
     * This method listens for a shift key press and forces the user to draw a square.
     *
     * @param event The keyboardEvent to process.
     */
    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isShiftPressed = true;
        }
    }

    /**
     * This method listens for a shift key release and updates the isShiftPressed attribute in
     * consequences.
     *
     * @param event The keyboardEvent to process.
     */
    @HostListener('window:keyup', ['$event'])
    buttonRelease(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isShiftPressed = false;
        }
    }

    /**
     * Detects the mouse release on the canvas.
     * If the rectangle mode is on, it applies the rectangle to the foreground canvas.
     *
     * @param event The mouse event.
     */
    canvasRelease(): void {
        this.isDragging = false;
        this.lastMousePosition = { x: -1, y: -1 };
        if (this.mouseService.isRectangleMode) {
            const ctx = this.foregroundCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            ctx.drawImage(this.tempCanvas, 0, 0);
            const currentCanvas = document.body.querySelector('#' + this.foregroundCanvas.nativeElement.id) as HTMLCanvasElement;
            const parentElement = currentCanvas.parentElement as HTMLElement;
            parentElement.removeChild(this.tempCanvas);
        }
    }

    /**
     * Detects the mouse click on the canvas, and calls the appropriate function for drawing.
     * If a temporary canvas exists, it is removed and drawn on the foreground canvas.
     *
     * @param event The mouse event.
     */
    canvasClick(event: MouseEvent): void {
        const currentCanvas = document.body.querySelector('#' + this.foregroundCanvas.nativeElement.id) as HTMLCanvasElement;
        const parentElement = currentCanvas.parentElement as HTMLElement;
        const siblingDrawElements = parentElement.querySelectorAll('.draw') as NodeListOf<HTMLCanvasElement>;
        siblingDrawElements.forEach((element) => {
            const siblingCanvas = element as HTMLCanvasElement;
            const ctx = this.foregroundCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            ctx.drawImage(siblingCanvas, 0, 0);
            element.remove();
        });
        this.isDragging = true;
        this.mouseService.mouseDrag(event);
        this.lastMousePosition = { x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2;
        if (!this.mouseService.isRectangleMode) {
            this.drawService.context = this.foregroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            this.drawService.draw(this.lastMousePosition);
        } else {
            this.createTempCanvas();
        }
    }

    /**
     * Detects the mouse movement on the canvas when clicking on it.
     * It then calls the appropriate function for drawing.
     *
     * @param event the mouse event
     */
    canvasDrag(event: MouseEvent): void {
        if (this.mouseService && this.isDragging) {
            if (this.mouseService.isRectangleMode) {
                this.canvasRectangularDrag(event);
            } else this.canvasPaint(event);
        }
    }

    /**
     * Method called after the initial rendering.
     */
    ngAfterViewInit(): void {
        this.loadBackground(this.image);
        this.foregroundCanvas.nativeElement.id = this.isDiff ? 'diffDrawCanvas' : 'defaultDrawCanvas';
        this.foregroundCanvas.nativeElement.addEventListener('mousedown', this.canvasClick.bind(this));
        this.foregroundCanvas.nativeElement.addEventListener('mouseup', this.canvasRelease.bind(this));
        this.foregroundCanvas.nativeElement.addEventListener('mousemove', this.canvasDrag.bind(this));
        this.drawService.context = this.foregroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    /**
     * The function in charge of loading the image on the canvas.
     * It is also used to reload the image and erase any text or modifications we may
     * have added to it.
     *
     * @param imageSource The imageSource to load on the canvas.
     */
    loadBackground(imageSource: string): void {
        if (this.backgroundCanvas) {
            this.backgroundCanvas.nativeElement.id = this.isDiff ? 'diffImgCanvas' : 'defaultImgCanvas';
            const context = this.backgroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            if (!this.isDiff) {
                this.canvasSharing.defaultCanvas = this.backgroundCanvas.nativeElement;
            } else {
                this.canvasSharing.diffCanvas = this.backgroundCanvas.nativeElement;
            }
            this.currentImage = new Image();
            this.currentImage.crossOrigin = 'anonymous';
            this.currentImage.src = imageSource;
            this.currentImage.onload = () => {
                context.drawImage(this.currentImage, 0, 0, this.width, this.height);
            };
            this.backgroundCanvas.nativeElement.style.backgroundColor = 'white';
            this.backgroundCanvas.nativeElement.focus();
        }
    }

    /**
     * Merges the background and foreground canvas into one canvas.
     *
     * @returns An HTMLCanvasElement containing the result.
     */
    mergeCanvas(): HTMLCanvasElement {
        const resultCanvas = document.createElement('canvas');
        resultCanvas.width = this.width;
        resultCanvas.height = this.height;
        const canvasCtx = resultCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasCtx.drawImage(this.backgroundCanvas.nativeElement, 0, 0);
        canvasCtx.drawImage(this.foregroundCanvas.nativeElement, 0, 0);
        return resultCanvas;
    }

    /**
     * Creates a temporary canvas on top of the other canvases.
     * It is used to display the rectangle in real time before applying it to the foreground canvas.
     */
    createTempCanvas(): void {
        this.drawService.paintBrush();
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.className = 'draw';
        this.tempCanvas.style.position = 'absolute';
        this.tempCanvas.style.top = this.foregroundCanvas.nativeElement.offsetTop + 'px';
        this.tempCanvas.style.left = this.foregroundCanvas.nativeElement.offsetLeft + 'px';
        this.tempCanvas.width = this.width;
        this.tempCanvas.height = this.height;
        this.drawService.context = this.tempCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawService.setPaintColor(this.mouseService.mouseDrawColor);
        const currentCanvas = document.body.querySelector('#' + this.foregroundCanvas.nativeElement.id) as HTMLCanvasElement;
        currentCanvas.after(this.tempCanvas);
        this.tempCanvas.addEventListener('mousedown', this.canvasClick.bind(this));
        this.tempCanvas.addEventListener('mouseup', this.canvasRelease.bind(this));
        this.tempCanvas.addEventListener('mousemove', this.canvasDrag.bind(this));
    }

    /**
     * Paints the canvas in real time on mouse movement.
     *
     * @param event The mouse event.
     */
    canvasPaint(event: MouseEvent): void {
        this.mouseService.mouseDrag(event);
        const accCoords = { x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2;
        if (accCoords.x < 0 || accCoords.y < 0 || accCoords.x > this.width || accCoords.y > this.height) {
            this.canvasRelease();
        } else {
            this.drawService.context = this.foregroundCanvas.nativeElement.getContext('2d', {
                willReadFrequently: true,
            }) as CanvasRenderingContext2D;
            this.drawService.setPaintColor(this.mouseService.mouseDrawColor);
            this.drawService.draw(accCoords, this.lastMousePosition);
            this.lastMousePosition = accCoords;
        }
    }

    /**
     * Shows a rectangle on the tempCanvas in real time on mouse movement.
     * When shift is pressed, the rectangle is a square.
     *
     * @param event The mouse event.
     */
    canvasRectangularDrag(event: MouseEvent): void {
        this.mouseService.mouseDrag(event);
        const accCoords = { x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2;
        if (accCoords.x <= 0 || accCoords.y < 0 || accCoords.x > this.width || accCoords.y > this.height - 2) {
            this.canvasRelease();
        } else {
            this.drawService.context = this.tempCanvas.getContext('2d', {
                willReadFrequently: true,
            }) as CanvasRenderingContext2D;
            this.drawService.context.clearRect(0, 0, this.width, this.height);
            if (this.isShiftPressed) {
                let squareSizeX = 0;
                let squareSizeY = 0;
                const xDistance = accCoords.x - this.lastMousePosition.x;
                const yDistance = accCoords.y - this.lastMousePosition.y;
                if (Math.abs(xDistance) < Math.abs(yDistance)) {
                    squareSizeX = xDistance;
                    squareSizeY = (yDistance > 0 && xDistance > 0) || (yDistance < 0 && xDistance < 0) ? squareSizeX : -squareSizeX;
                } else {
                    squareSizeY = yDistance;
                    squareSizeX = (xDistance > 0 && yDistance > 0) || (xDistance < 0 && yDistance < 0) ? squareSizeY : -squareSizeY;
                }
                this.drawService.drawRect(this.lastMousePosition, squareSizeX, squareSizeY);
            } else {
                this.drawService.drawRect(this.lastMousePosition, accCoords.x - this.lastMousePosition.x, accCoords.y - this.lastMousePosition.y);
            }
        }
    }
}

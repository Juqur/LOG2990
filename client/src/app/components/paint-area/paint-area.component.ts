import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-paint-area',
    templateUrl: './paint-area.component.html',
    styleUrls: ['./paint-area.component.scss'],
    providers: [DrawService],
})
/**
 * This component represents one of the two canvas inside a game page.
 *
 * @author Simon Gagné
 * @class PaintAreaComponent
 */
export class PaintAreaComponent implements AfterViewInit {
    @Input() isDiff: boolean;
    @Input() image: string = '';
    @ViewChild('foregroundCanvas', { static: false }) fgCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('backgroundCanvas', { static: false }) bgCanvas!: ElementRef<HTMLCanvasElement>;
    undoRedoService: UndoRedoService = new UndoRedoService();
    currentImage: HTMLImageElement;
    isShiftPressed = false;
    isDragging = false;
    private lastMousePosition: Vec2 = { x: -1, y: -1 };
    private tempCanvas: HTMLCanvasElement;

    private canvasSize = { x: Constants.DEFAULT_WIDTH, y: Constants.DEFAULT_HEIGHT };
    constructor(private readonly drawService: DrawService, private canvasSharing: CanvasSharingService, private mouseService: MouseService) {}

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
     * This method listens for a shift key press and updates the isShiftPressed attribute in
     * consequences.
     *
     * @param event the keyboardEvent to process.
     */
    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (event.key === 'Shift') {
            this.isShiftPressed = true;
        }
    }

    /**
     * This method listens for a shift key release and updates the isShiftPressed attribute in
     * consequences.
     *
     * @param event the keyboardEvent to process.
     */
    @HostListener('window:keyup', ['$event'])
    buttonRelease(event: KeyboardEvent) {
        if (event.key === 'Shift') {
            this.isShiftPressed = false;
        }
    }

    /**
     * Method called after the initial rendering.
     */
    ngAfterViewInit(): void {
        this.loadBackground(this.image);
        this.fgCanvas.nativeElement.id = this.isDiff ? 'diffDrawCanvas' : 'defaultDrawCanvas';
        this.fgCanvas.nativeElement.addEventListener('mousedown', this.canvasClick.bind(this));
        this.fgCanvas.nativeElement.addEventListener('mouseup', this.canvasRelease.bind(this));
        this.fgCanvas.nativeElement.addEventListener('mousemove', this.canvasDrag.bind(this));
        this.drawService.context = this.fgCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    /**
     * Getter for the foreground canvas.
     */
    getPaintCanvas() {
        return this.fgCanvas.nativeElement;
    }

    /**
     * The function in charge of loading the image on the canvas.
     * It is also used to reload the image and erase any text or modifications we may
     * have added to it.
     *
     * @param image the image source
     */
    loadBackground(image: string) {
        if (this.bgCanvas) {
            this.bgCanvas.nativeElement.id = this.isDiff ? 'diffImgCanvas' : 'defaultImgCanvas';
            const context = this.bgCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            if (!this.isDiff) {
                // Default canvas (left canvas)
                this.canvasSharing.defaultCanvas = this.bgCanvas.nativeElement;
            } else {
                // Diff canvas (right canvas)
                this.canvasSharing.diffCanvas = this.bgCanvas.nativeElement;
            }
            this.currentImage = new Image();
            this.currentImage.crossOrigin = 'anonymous';
            this.currentImage.src = image;
            this.currentImage.onload = () => {
                context.drawImage(this.currentImage, 0, 0, this.width, this.height);
            };
            this.bgCanvas.nativeElement.style.backgroundColor = 'white';
            this.bgCanvas.nativeElement.focus();
        }
    }

    /**
     * Merges the background and foreground canvas into one canvas.
     *
     * @returns an HTMLCanvasElement containing the result.
     */
    mergeCanvas(): HTMLCanvasElement {
        const resultCanvas = document.createElement('canvas');
        resultCanvas.width = this.width;
        resultCanvas.height = this.height;
        resultCanvas.getContext('2d')?.drawImage(this.bgCanvas.nativeElement, 0, 0);
        resultCanvas.getContext('2d')?.drawImage(this.fgCanvas.nativeElement, 0, 0);
        return resultCanvas;
    }

    /**
     * Creates a temporary canvas on top of the other canvases.
     * It is used to display the rectangle in real time before applying it to the foreground canvas.
     */
    createTempCanvas() {
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.className = 'draw';
        this.tempCanvas.style.position = 'absolute';
        this.tempCanvas.style.top = this.fgCanvas.nativeElement.offsetTop + 'px';
        this.tempCanvas.style.left = this.fgCanvas.nativeElement.offsetLeft + 'px';
        this.tempCanvas.width = this.width;
        this.tempCanvas.height = this.height;
        this.drawService.context = this.tempCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawService.setPaintColor(this.mouseService.mouseDrawColor);
        const currentCanvas = document.body.querySelector('#' + this.fgCanvas.nativeElement.id);
        currentCanvas?.parentNode?.insertBefore(this.tempCanvas, currentCanvas);
        this.tempCanvas.addEventListener('mousedown', this.canvasClick.bind(this));
        this.tempCanvas.addEventListener('mouseup', this.canvasRelease.bind(this));
        this.tempCanvas.addEventListener('mousemove', this.canvasDrag.bind(this));
    }

    /**
     * Detects the mouse click on the canvas, and calls the appropriate function for drawing.
     * If a temporary canvas exists, it is removed and drawn on the foreground canvas.
     *
     * @param event the mouse event
     */
    canvasClick(event: MouseEvent) {
        const currentCanvas = document.body.querySelector('#' + this.fgCanvas.nativeElement.id);
        const siblingDrawElements = currentCanvas?.parentElement?.querySelectorAll('.draw');
        siblingDrawElements?.forEach((element) => {
            const siblingCanvas = element as HTMLCanvasElement;
            this.fgCanvas.nativeElement.getContext('2d')?.drawImage(siblingCanvas, 0, 0);
            element.remove();
        });
        this.isDragging = true;
        this.mouseService.mouseDrag(event);
        this.lastMousePosition = { x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2;
        if (!this.mouseService.isRectangleMode) {
            this.drawService.context = this.fgCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
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
    canvasDrag(event: MouseEvent) {
        if (this.mouseService) {
            if (this.isDragging) {
                if (this.mouseService.isRectangleMode) {
                    this.canvasRectangularDrag(event);
                } else this.canvasPaint(event);
            }
        }
    }

    /**
     * Paints the canvas in real time on mouse movement.
     *
     * @param event the mouse event
     */
    canvasPaint(event: MouseEvent) {
        this.mouseService.mouseDrag(event);
        const accCoords = { x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2;
        if (accCoords.x <= 0 || accCoords.y < 0 || accCoords.x > this.width || accCoords.y > this.height - 2) {
            this.canvasRelease();
        } else {
            this.drawService.context = this.fgCanvas.nativeElement.getContext('2d', {
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
     * @param event the mouse event
     */
    canvasRectangularDrag(event: MouseEvent) {
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
                if (Math.abs(xDistance) > Math.abs(yDistance)) {
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

    /**
     * Detects the mouse release on the canvas.
     * If the rectangle mode is on, it applies the rectangle to the foreground canvas.
     *
     * @param event the mouse event
     */
    canvasRelease() {
        this.isDragging = false;
        this.lastMousePosition = { x: -1, y: -1 };
        if (this.mouseService.isRectangleMode) {
            this.fgCanvas.nativeElement.getContext('2d')?.drawImage(this.tempCanvas, 0, 0);
            document.body.querySelector('#' + this.fgCanvas.nativeElement.id)?.parentNode?.removeChild(this.tempCanvas);
        }
    }
}

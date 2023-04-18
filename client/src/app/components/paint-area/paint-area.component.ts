import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { CanvasSharingService } from '@app/services/canvas-sharing/canvas-sharing.service';
import { DrawService } from '@app/services/draw/draw.service';
import { MouseService } from '@app/services/mouse/mouse.service';
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
    @Input() isDifferenceCanvas: boolean;
    @Input() image: string = '';
    @ViewChild('foregroundCanvas', { static: false }) private foregroundCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('backgroundCanvas', { static: false }) private backgroundCanvas!: ElementRef<HTMLCanvasElement>;
    currentImage: HTMLImageElement;
    isClicked = false;

    private isShiftPressed = false;
    private lastMousePosition: Vec2 = { x: -1, y: -1 };
    private tempCanvas: HTMLCanvasElement;

    constructor(private readonly drawService: DrawService, private canvasSharing: CanvasSharingService, private mouseService: MouseService) {}

    /**
     * Getter for the canvas width.
     */
    get width(): number {
        return Constants.DEFAULT_WIDTH;
    }

    /**
     * Getter for the canvas height.
     */
    get height(): number {
        return Constants.DEFAULT_HEIGHT;
    }

    /**
     * Getter for the foreground canvas.
     */
    get canvas(): HTMLCanvasElement {
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
     * This method listens for a shift key release.
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
     * This method is called after the initial rendering.
     */
    ngAfterViewInit(): void {
        this.loadBackground(this.image);
        this.foregroundCanvas.nativeElement.id = this.isDifferenceCanvas ? 'diffDrawCanvas' : 'defaultDrawCanvas';
        this.foregroundCanvas.nativeElement.addEventListener('mousedown', this.onCanvasClick.bind(this));
        this.foregroundCanvas.nativeElement.addEventListener('mousemove', this.onCanvasDrag.bind(this));
        this.foregroundCanvas.nativeElement.addEventListener('mouseout', this.onMouseOut.bind(this));
        this.drawService.context = this.foregroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    /**
     * This method is a event handler when the mouse is outside the canvas.
     * It prevents the interpolation of two points when the mouse is outside the canvas.
     */
    onMouseOut(): void {
        this.drawService.isInCanvas = false;
    }

    /**
     * This method is a event handler of the mouse click inside the canvas.
     * If a temporary canvas exists, it is removed and drawn on the foreground canvas.
     *
     * @param event The mouse event.
     */
    onCanvasClick(event: MouseEvent): void {
        this.isClicked = true;
        const canvas = this.foregroundCanvas.nativeElement;
        const parent = canvas.parentElement as HTMLElement;
        const drawElements = parent.querySelectorAll('.draw');
        this.drawSiblingCanvases(drawElements as NodeListOf<HTMLCanvasElement>);

        this.mouseService.mouseDrag(event);
        this.lastMousePosition = { x: this.mouseService.x, y: this.mouseService.y } as Vec2;

        if (!this.mouseService.isRectangleMode) {
            this.drawService.context = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            this.drawService.draw(this.lastMousePosition);
        } else {
            this.createTemporaryCanvas();
        }
    }

    /**
     * This method is a event handler of the mouse release globally.
     * If the rectangle mode is on, it applies the rectangle to the foreground canvas.
     *
     * @param event The mouse event.
     */
    onCanvasRelease(): void {
        this.isClicked = false;
        this.lastMousePosition = { x: -1, y: -1 };
        if (this.mouseService.isRectangleMode) {
            const context = this.foregroundCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            context.drawImage(this.tempCanvas, 0, 0);
            const canvas = this.foregroundCanvas.nativeElement;
            const parent = canvas.parentElement as HTMLElement;
            parent.removeChild(this.tempCanvas);
        }
    }

    /**
     * This method is a event handler of the mouse drag inside the canvas.
     *
     * @param event The mouse event.
     */
    onCanvasDrag(event: MouseEvent): void {
        if (this.isClicked) {
            if (this.mouseService.isRectangleMode) {
                this.canvasRectangularDrag(event);
            } else this.paintCanvas(event);
        }
    }

    /**
     * The function in charge of loading the image on the canvas.
     * It is also used to reload the image and erase any text or modifications we may
     * have added to it.
     *
     * @param imageSource The imageSource to load on the canvas.
     */
    loadBackground(imageSource: string): void {
        this.backgroundCanvas.nativeElement.id = this.isDifferenceCanvas ? 'diffImgCanvas' : 'defaultImgCanvas';
        if (!this.isDifferenceCanvas) {
            this.canvasSharing.defaultCanvas = this.backgroundCanvas.nativeElement;
        } else {
            this.canvasSharing.differenceCanvas = this.backgroundCanvas.nativeElement;
        }

        const context = this.backgroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.currentImage = new Image();
        this.currentImage.crossOrigin = 'anonymous';
        this.currentImage.src = imageSource;
        this.currentImage.onload = async () => {
            context.drawImage(this.currentImage, 0, 0, this.width, this.height);
        };
        this.backgroundCanvas.nativeElement.style.backgroundColor = 'white';
        this.backgroundCanvas.nativeElement.focus();
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
        const canvasContext = resultCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasContext.drawImage(this.backgroundCanvas.nativeElement, 0, 0);
        canvasContext.drawImage(this.foregroundCanvas.nativeElement, 0, 0);
        return resultCanvas;
    }

    /**
     * Creates a temporary canvas on top of the other canvases.
     * It is used to display the rectangle in real time before applying it to the foreground canvas.
     */
    createTemporaryCanvas(): void {
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
        const currentCanvas = this.foregroundCanvas.nativeElement;
        currentCanvas.after(this.tempCanvas);
        this.tempCanvas.addEventListener('mousedown', this.onCanvasClick.bind(this));
        this.tempCanvas.addEventListener('mousemove', this.onCanvasDrag.bind(this));
        this.tempCanvas.addEventListener('mouseout', this.onMouseOut.bind(this));
    }

    /**
     * Paints the canvas in real time on mouse movement.
     *
     * @param event The mouse event.
     */
    paintCanvas(event: MouseEvent): void {
        this.mouseService.mouseDrag(event);
        const { x, y }: Vec2 = this.mouseService;
        this.drawService.context = this.foregroundCanvas.nativeElement.getContext('2d', {
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
        this.drawService.setPaintColor(this.mouseService.mouseDrawColor);
        this.drawService.draw({ x, y }, this.lastMousePosition);
        this.lastMousePosition = { x, y };
    }

    /**
     * Shows a rectangle on the tempCanvas in real time on mouse movement.
     * When shift is pressed, the rectangle is a square.
     *
     * @param event The mouse event.
     */
    canvasRectangularDrag(event: MouseEvent): void {
        this.mouseService.mouseDrag(event);
        const { x, y }: Vec2 = this.mouseService;

        this.drawService.context = this.tempCanvas.getContext('2d', {
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
        this.drawService.context.clearRect(0, 0, this.width, this.height);
        if (this.isShiftPressed) {
            let squareSizeX = 0;
            let squareSizeY = 0;
            const xDistance = x - this.lastMousePosition.x;
            const yDistance = y - this.lastMousePosition.y;
            if (Math.abs(xDistance) < Math.abs(yDistance)) {
                squareSizeX = xDistance;
                squareSizeY = Math.sign(yDistance) * Math.abs(xDistance);
            } else {
                squareSizeY = yDistance;
                squareSizeX = Math.sign(xDistance) * Math.abs(yDistance);
            }
            this.drawService.drawRectangle(this.lastMousePosition, squareSizeX, squareSizeY);
        } else {
            this.drawService.drawRectangle(this.lastMousePosition, x - this.lastMousePosition.x, y - this.lastMousePosition.y);
        }
    }

    /**
     * Internal method that draws the rectangle on the foreground canvas and removes it.
     *
     * @param siblingCanvases The sibling canvases of the foreground canvas.
     */
    private drawSiblingCanvases(siblingCanvases: NodeListOf<HTMLCanvasElement>): void {
        siblingCanvases.forEach((siblingCanvas) => {
            const context = this.foregroundCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            context.drawImage(siblingCanvas, 0, 0);
            siblingCanvas.remove();
        });
    }
}

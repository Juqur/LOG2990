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
    @ViewChild('gridCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
    undoRedoService: UndoRedoService = new UndoRedoService();
    currentImage: HTMLImageElement;
    buttonPressed = '';
    private isDragging = false;
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
        this.drawPaintArea(this.image);
    }

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
    drawPaintArea(image: string) {
        if (this.canvas) {
            this.canvas.nativeElement.addEventListener('mousedown', this.canvasClick.bind(this));
            this.canvas.nativeElement.addEventListener('mouseup', this.canvasRelease.bind(this));
            this.canvas.nativeElement.addEventListener('mousemove', this.canvasDrag.bind(this));
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
     *\
     *
     * @param ms a number of milliseconds
     * @return promise that resolves after ms milliseconds
     */
    async timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    createTempCanvas() {
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.className = 'draw';
        this.tempCanvas.style.position = 'absolute';
        this.tempCanvas.style.top = this.canvas.nativeElement.offsetTop + 'px';
        this.tempCanvas.style.left = this.canvas.nativeElement.offsetLeft + 'px';
        this.tempCanvas.width = this.width;
        this.tempCanvas.height = this.height;
        document.body.querySelector('#grid-container')?.insertBefore(this.tempCanvas, this.canvas.nativeElement);
        this.tempCanvas.addEventListener('mousedown', this.canvasClick.bind(this));
        this.tempCanvas.addEventListener('mouseup', this.canvasRelease.bind(this));
        this.tempCanvas.addEventListener('mousemove', this.canvasDrag.bind(this));
    }

    canvasClick(event: MouseEvent) {
        this.isDragging = true;
        this.mouseService.mouseDrag(event);
        this.lastMousePosition = { x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2;
        // console.log(this.isRectangle);
        if (!this.mouseService.isRectangleMode) {
            this.drawService.context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            this.drawService.draw(this.lastMousePosition);
        } else {
            this.createTempCanvas();
        }
    }

    canvasDrag(event: MouseEvent) {
        if (this.mouseService) {
            if (this.isDragging) {
                if (this.mouseService.isRectangleMode) {
                    this.canvasRectangularDrag(event);
                } else this.canvasPaint(event);
            }
        }
    }

    canvasPaint(event: MouseEvent) {
        this.mouseService.mouseDrag(event);
        const accCoords = { x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2;
        if (accCoords.x <= 0 || accCoords.y < 0 || accCoords.x > this.width || accCoords.y > this.height - 2) {
            this.canvasRelease(event);
        } else {
            this.drawService.context = this.canvas.nativeElement.getContext('2d', {
                willReadFrequently: true,
            }) as CanvasRenderingContext2D;
            this.drawService.draw(accCoords, this.lastMousePosition);
            this.lastMousePosition = accCoords;
        }
    }

    canvasRectangularDrag(event: MouseEvent) {
        this.mouseService.mouseDrag(event);
        const accCoords = { x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2;
        if (accCoords.x <= 0 || accCoords.y < 0 || accCoords.x > this.width || accCoords.y > this.height - 2) {
            this.canvasRelease(event);
        } else {
            this.drawService.context = this.tempCanvas.getContext('2d', {
                willReadFrequently: true,
            }) as CanvasRenderingContext2D;
            this.drawService.context.clearRect(0, 0, this.width, this.height);
            this.drawService.drawRect(this.lastMousePosition, accCoords.x - this.lastMousePosition.x, accCoords.y - this.lastMousePosition.y);
        }
    }

    handleAreaNotFoundInOriginal() {
        // this.audioService.playSound('./assets/audio/failed.mp3');
        this.drawService.context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawService.draw({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
        // this.mouseService.changeClickState();
    }

    canvasRelease(event: MouseEvent) {
        console.log('release');
        this.isDragging = false;
        this.lastMousePosition = { x: -1, y: -1 };
        if (this.mouseService.isRectangleMode) {
            this.canvas.nativeElement.getContext('2d')?.drawImage(this.tempCanvas, 0, 0);
            document.body.querySelector('#grid-container')?.removeChild(this.tempCanvas);
        }
        // this.undoRedoService.addState(this.canvas.nativeElement.getContext('2d'));
    }
}

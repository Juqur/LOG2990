/* eslint-disable max-lines */
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PaintAreaComponent } from '@app/components/paint-area/paint-area.component';
import { Level } from '@app/levels';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { CreationPageService } from '@app/services/creationPageService/creation-page.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
    providers: [UndoRedoService],
})
/**
 * This component represents the creation, the page where we can create new levels/games.
 *
 * @author Simon Gagné
 * @class CreationComponent
 */
export class CreationComponent implements OnInit, OnDestroy {
    @ViewChild('defaultArea', { static: false }) defaultPaintArea!: PaintAreaComponent;
    @ViewChild('diffArea', { static: false }) diffPaintArea!: PaintAreaComponent;
    sliderValue = Constants.SLIDER_DEFAULT;
    defaultImageFile: File | null = null;
    diffImageFile: File | null = null;
    radius = Constants.RADIUS_DEFAULT;
    radiusTable = Constants.RADIUS_TABLE;
    nbDifferences = Constants.INIT_DIFF_NB;
    isSaveable = false;
    defaultArea: PaintAreaComponent | null = null;
    modifiedArea: PaintAreaComponent | null = null;
    defaultCanvasCtx: CanvasRenderingContext2D | null = null;
    diffCanvasCtx: CanvasRenderingContext2D | null = null;
    defaultImageUrl = '';
    msg = '';
    differenceAmountMsg = '';
    savedLevel: Level;
    color = Constants.BLACK;

    drawServiceDefault: DrawService;
    drawServiceDiff: DrawService;

    // eslint-disable-next-line max-params
    constructor(
        private canvasShare: CanvasSharingService,
        private mouseServiceDefault: MouseService,
        private mouseServiceDiff: MouseService,
        public creationService: CreationPageService,
    ) {}

    @HostListener('window:keydown ', ['$event'])
    onKeyPress($event: KeyboardEvent) {
        let canvas: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined;
        if ($event.ctrlKey && $event.shiftKey && $event.key === 'Z') {
            if (!UndoRedoService.isRedoStackEmpty()) {
                canvas = UndoRedoService.redo();
            }
        } else if ($event.ctrlKey && $event.key === 'z') {
            // if (!UndoRedoService.isUndoStackEmpty()) {
            //     canvas = UndoRedoService.undo();
            // }
            canvas = UndoRedoService.undo();
        }
        this.applyChanges(canvas);
    }

    /**
     * The method initiates two empty canvas on the page. The canvases are represented by two
     * PaintArea components.
     */
    ngOnInit(): void {
        this.drawServiceDefault = new DrawService();
        this.drawServiceDiff = new DrawService();
        this.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.defaultCanvas = this.defaultCanvasCtx?.canvas as HTMLCanvasElement;
        this.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.diffCanvas = this.diffCanvasCtx?.canvas as HTMLCanvasElement;
        this.defaultArea = new PaintAreaComponent(this.drawServiceDefault, this.canvasShare, this.mouseServiceDefault);
        this.modifiedArea = new PaintAreaComponent(this.drawServiceDiff, this.canvasShare, this.mouseServiceDiff);
    }

    ngOnDestroy(): void {
        UndoRedoService.resetAllStacks();
    }

    /**
     * Changes the value of the radius depending on a value given as parameter. The possible options
     * are 0, 3, 9, and 15 each corresponding to the indexes 0, 1, 2 and 3 that can be given as parameters
     *
     * @param value the index of the new slider value
     */
    sliderChange(value: number) {
        this.radius = this.radiusTable[value];
    }

    paintBrushMode() {
        this.mouseServiceDefault.isRectangleMode = false;
        this.mouseServiceDiff.isRectangleMode = false;
        this.drawServiceDefault.context = this.canvasShare.defaultCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDiff.context = this.canvasShare.diffCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDefault.paintBrush();
        this.drawServiceDiff.paintBrush();
    }

    eraseBrushMode() {
        this.mouseServiceDefault.isRectangleMode = false;
        this.mouseServiceDiff.isRectangleMode = false;
        this.drawServiceDefault.context = this.canvasShare.defaultCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDiff.context = this.canvasShare.diffCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDefault.eraseBrush();
        this.drawServiceDiff.eraseBrush();
    }

    rectangleMode() {
        this.paintBrushMode();
        this.mouseServiceDefault.isRectangleMode = true;
        this.mouseServiceDiff.isRectangleMode = true;
    }

    colorPickerMode() {
        this.mouseServiceDefault.mouseDrawColor = this.color;
        this.mouseServiceDiff.mouseDrawColor = this.color;
        this.drawServiceDefault.setPaintColor(this.color);
        this.drawServiceDiff.setPaintColor(this.color);
    }

    addToUndoRedoStack() {
        const leftCanvas = this.canvasShare.defaultCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const rightCanvas = this.canvasShare.diffCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        UndoRedoService.resetRedoStack();
        // UndoRedoService.resizeUndoStack();
        UndoRedoService.addToStack(leftCanvas, rightCanvas);
    }

    applyChanges(canvas: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined) {
        if (!canvas) return;

        this.canvasShare.defaultCanvas.getContext('2d')?.clearRect(0, 0, this.canvasShare.defaultCanvas.width, this.canvasShare.defaultCanvas.height);
        this.canvasShare.diffCanvas.getContext('2d')?.clearRect(0, 0, this.canvasShare.diffCanvas.width, this.canvasShare.diffCanvas.height);

        this.canvasShare.defaultCanvas.getContext('2d')?.drawImage(canvas.defaultCanvas, 0, 0);
        this.canvasShare.diffCanvas.getContext('2d')?.drawImage(canvas.diffCanvas, 0, 0);
    }
}

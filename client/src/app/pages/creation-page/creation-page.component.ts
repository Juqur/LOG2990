import { AfterViewInit, Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { PaintAreaComponent } from '@app/components/paint-area/paint-area.component';
import { CreationPageService } from '@app/services/creation-page/creation-page.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Constants } from '@common/constants';

/**
 * This component represents the creation, the page where we can create new levels/games.
 *
 * @author Simon Gagné & Galen Hu
 * @class CreationPageComponent
 */
@Component({
    selector: 'app-creation-page',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss', '../pages.scss'],
})
export class CreationPageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('defaultArea', { static: false }) private defaultPaintArea!: PaintAreaComponent;
    @ViewChild('differenceArea', { static: false }) private differencePaintArea!: PaintAreaComponent;
    diffSliderValue = Constants.SLIDER_DEFAULT;
    brushSliderValue = 1;

    constructor(public creationService: CreationPageService) {}

    /**
     * When the user presses ctrl z it calls the handleUndo method.
     * When the user presses ctrl shift z it calls the handleRedo method.
     *
     * @param $event The event that is triggered when the user press a key.
     */
    @HostListener('window:keydown ', ['$event'])
    onKeyPress($event: KeyboardEvent): void {
        if ($event.ctrlKey && $event.shiftKey && ($event.key === 'Z' || $event.key === 'z')) {
            this.handleRedo();
        } else if ($event.ctrlKey && ($event.key === 'Z' || $event.key === 'z')) {
            this.handleUndo();
        }
    }

    /**
     * This method listens for a global mouse release.
     */
    @HostListener('window:mouseup', ['$event'])
    mouseUp(): void {
        if (this.defaultPaintArea.isClicked) {
            this.defaultPaintArea.onCanvasRelease();
            this.addToUndoRedoStack();
        }

        if (this.differencePaintArea.isClicked) {
            this.differencePaintArea.onCanvasRelease();
            this.addToUndoRedoStack();
        }
    }

    /**
     * Method called after the initial rendering.
     * It makes sur both backgrounds are empty.
     */
    ngAfterViewInit(): void {
        this.creationService.resetDefaultBackground();
        this.creationService.resetDiffBackground();
        this.setPaintBrushMode();
    }

    /**
     * After leaving the page, this method is called.
     * It resets the undo/redo stack.
     */
    ngOnDestroy(): void {
        UndoRedoService.resetAllStacks();
    }

    /**
     * Set the size of the brush.
     *
     * @param event The event that is triggered when the user changes the value of the slider.
     */
    setBrushSize(event: MatSliderChange): void {
        const defaultCtx = this.defaultPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = this.differencePaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.creationService.brushSliderChange(event as unknown as MatSlider, defaultCtx, diffCtx);
    }

    /**
     * Sets the drawing mode to paint brush.
     */
    setPaintBrushMode(): void {
        const defaultCtx = this.defaultPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = this.differencePaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.creationService.paintBrushMode(defaultCtx, diffCtx);
    }

    /**
     * Sets the drawing mode to erase brush.
     */
    setEraseBrushMode(): void {
        const defaultCtx = this.defaultPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = this.differencePaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.creationService.eraseBrushMode(defaultCtx, diffCtx);
    }

    /**
     * Merges the layers of the canvas and calls the detectDifference function.
     */
    findDifference(): void {
        const defaultCtx = this.defaultPaintArea.mergeCanvas().getContext('2d') as CanvasRenderingContext2D;
        const diffCtx = this.differencePaintArea.mergeCanvas().getContext('2d') as CanvasRenderingContext2D;
        this.creationService.detectDifference(defaultCtx, diffCtx);
    }

    /**
     * When the user's mouse is released from the canvas, this method is called.
     * It adds both canvas to the undo/redo stack.
     * It also resets the redo stack.
     */
    addToUndoRedoStack(): void {
        const leftCanvas = this.defaultPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const rightCanvas = this.differencePaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.creationService.saveFalse();
        UndoRedoService.resetRedoStack();
        UndoRedoService.addToStack(leftCanvas, rightCanvas);
    }

    /**
     * When the user press on the undo button or press ctrl z, this method is called.
     */
    handleUndo(): void {
        this.applyChanges(UndoRedoService.undo());
    }

    /**
     * When the user press on the redo button or press ctrl shift z, this method is called.
     */
    handleRedo(): void {
        this.applyChanges(UndoRedoService.redo());
    }

    /**
     * After the undo or redo function has been called, this method will apply the changes to the canvas.
     *
     * @param canvas Takes 2 canvas, the default (left) canvas and the diff (right) canvas.
     */
    applyChanges(canvas: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined): void {
        if (!canvas) return;
        this.setPaintBrushMode();
        this.creationService.saveFalse();
        const defaultCtx = this.defaultPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = this.differencePaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

        defaultCtx.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        diffCtx.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);

        defaultCtx.drawImage(canvas.defaultCanvas, 0, 0);
        diffCtx.drawImage(canvas.diffCanvas, 0, 0);
    }

    /**
     * Event when the user press on the swap button, this method is called.
     */
    onSwapCanvas(): void {
        this.setPaintBrushMode();
        const defaultCanvas = this.defaultPaintArea.canvas;
        const diffCanvas = this.differencePaintArea.canvas;
        const tempCanvas = defaultCanvas.cloneNode() as HTMLCanvasElement;
        const tempCanvasContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        const defaultCanvasContext = defaultCanvas.getContext('2d') as CanvasRenderingContext2D;
        const differenceCanvasContext = diffCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCanvasContext.drawImage(defaultCanvas, 0, 0);
        defaultCanvasContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        defaultCanvasContext.drawImage(diffCanvas, 0, 0);
        differenceCanvasContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        differenceCanvasContext.drawImage(tempCanvas, 0, 0);
        this.addToUndoRedoStack();
    }

    /**
     * Clear the foreground of the default canvas.
     */
    clearDefaultCanvas(): void {
        const defaultPaintAreaContext = this.defaultPaintArea.canvas.getContext('2d') as CanvasRenderingContext2D;
        defaultPaintAreaContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        this.addToUndoRedoStack();
    }

    /**
     * Clear the foreground of the diff canvas.
     */
    clearDiffCanvas(): void {
        const differencePaintAreaContext = this.differencePaintArea.canvas.getContext('2d') as CanvasRenderingContext2D;
        differencePaintAreaContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        this.addToUndoRedoStack();
    }

    /**
     * Copy the foreground of the default canvas to the diff canvas.
     */
    duplicateDefaultCanvas(): void {
        this.setPaintBrushMode();
        const defaultCanvas = this.defaultPaintArea.canvas;
        const diffCanvas = this.differencePaintArea.canvas;
        const differenceCanvasContext = diffCanvas.getContext('2d') as CanvasRenderingContext2D;
        differenceCanvasContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        differenceCanvasContext.drawImage(defaultCanvas, 0, 0);
        this.addToUndoRedoStack();
    }

    /**
     * Copy the foreground of the diff canvas to the default canvas.
     */
    duplicateDifferenceCanvas(): void {
        this.setPaintBrushMode();
        const defaultCanvas = this.defaultPaintArea.canvas;
        const diffCanvas = this.differencePaintArea.canvas;
        const defaultCanvasContext = defaultCanvas.getContext('2d') as CanvasRenderingContext2D;
        defaultCanvasContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        defaultCanvasContext.drawImage(diffCanvas, 0, 0);
        this.addToUndoRedoStack();
    }
}

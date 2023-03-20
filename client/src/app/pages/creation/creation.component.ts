/* eslint-disable max-lines */
import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { PaintAreaComponent } from '@app/components/paint-area/paint-area.component';
import { CreationPageService } from '@app/services/creationPageService/creation-page.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
})
/**
 * This component represents the creation, the page where we can create new levels/games.
 *
 * @author Simon Gagné & Galen Hu
 * @class CreationComponent
 */
export class CreationComponent implements OnDestroy {
    @ViewChild('defaultArea', { static: false }) defaultPaintArea!: PaintAreaComponent;
    @ViewChild('diffArea', { static: false }) diffPaintArea!: PaintAreaComponent;
    diffSliderValue = Constants.SLIDER_DEFAULT;
    brushSliderValue = 1;

    constructor(public creationService: CreationPageService) {}

    @HostListener('window:keydown ', ['$event'])
    onKeyPress($event: KeyboardEvent) {
        if ($event.ctrlKey && $event.shiftKey && ($event.key === 'Z' || $event.key === 'z')) {
            this.handleRedo();
        } else if ($event.ctrlKey && ($event.key === 'Z' || $event.key === 'z')) {
            this.handleUndo();
        }
    }

    ngOnDestroy(): void {
        UndoRedoService.resetAllStacks();
    }

    /**
     * Sets the drawing mode to paint brush
     */
    setPaintBrushMode(): void {
        const defaultCtx = this.defaultPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = this.diffPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.creationService.paintBrushMode(defaultCtx, diffCtx);
    }

    /**
     * Sets the drawing mode to erase brush
     */
    setEraseBrushMode(): void {
        const defaultCtx = this.defaultPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = this.diffPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.creationService.eraseBrushMode(defaultCtx, diffCtx);
    }

    /**
     * Merges the layers of the canvas and calls the detectDifference function
     */
    findDifference(): void {
        const defaultCtx = this.defaultPaintArea.mergeCanvas().getContext('2d') as CanvasRenderingContext2D;
        const diffCtx = this.diffPaintArea.mergeCanvas().getContext('2d') as CanvasRenderingContext2D;
        this.creationService.detectDifference(defaultCtx, diffCtx);
    }

    /**
     * When the user's mouse is realeased from the canvas, this method is called
     * It adds both canvas to the undo/redo stack
     * It also resets the redo stack
     */
    addToUndoRedoStack(): void {
        const leftCanvas = this.defaultPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const rightCanvas = this.diffPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.creationService.saveFalse();
        UndoRedoService.resetRedoStack();
        UndoRedoService.addToStack(leftCanvas, rightCanvas);
    }

    /**
     * When the user press on the undo button or press ctrl z, this method is called
     */
    handleUndo(): void {
        this.applyChanges(UndoRedoService.undo());
    }

    /**
     * When the user press on the redo button or press ctrl shift z, this method is called
     */
    handleRedo(): void {
        this.applyChanges(UndoRedoService.redo());
    }

    /**
     * After the undo or redo function has been called, this method will apply the changes to the canvas
     *
     * @param canvas takes 2 canvas, the default(left) canvas and the diff(right) canvas
     * @returns undefined if the canvas is undefined
     */
    applyChanges(canvas: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined): void {
        if (!canvas) return;
        this.setPaintBrushMode();
        this.creationService.saveFalse();
        const defaultCtx = this.defaultPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = this.diffPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

        defaultCtx.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        diffCtx.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);

        defaultCtx.drawImage(canvas.defaultCanvas, 0, 0);
        diffCtx.drawImage(canvas.diffCanvas, 0, 0);
    }

    swapCanvas(): void {
        this.setPaintBrushMode();
        const defaultCanvas = this.defaultPaintArea.getPaintCanvas();
        const diffCanvas = this.diffPaintArea.getPaintCanvas();
        const tempCanvas = defaultCanvas.cloneNode() as HTMLCanvasElement;
        const tempCanvasContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        const defaultCanvasContext = defaultCanvas.getContext('2d') as CanvasRenderingContext2D;
        const diffCanvasContext = diffCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCanvasContext.drawImage(defaultCanvas, 0, 0);
        defaultCanvasContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        defaultCanvasContext.drawImage(diffCanvas, 0, 0);
        diffCanvasContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        diffCanvasContext.drawImage(tempCanvas, 0, 0);
        this.addToUndoRedoStack();
    }

    clearDefaultCanvas(): void {
        const defaultPaintAreaContext = this.defaultPaintArea.getPaintCanvas().getContext('2d') as CanvasRenderingContext2D;
        defaultPaintAreaContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        this.addToUndoRedoStack();
    }

    clearDiffCanvas(): void {
        const diffPaintAreaContext = this.diffPaintArea.getPaintCanvas().getContext('2d') as CanvasRenderingContext2D;
        diffPaintAreaContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        this.addToUndoRedoStack();
    }

    duplicateDefaultCanvas(): void {
        this.setPaintBrushMode();
        const defaultCanvas = this.defaultPaintArea.getPaintCanvas();
        const diffCanvas = this.diffPaintArea.getPaintCanvas();
        const diffCanvasContext = diffCanvas.getContext('2d') as CanvasRenderingContext2D;
        diffCanvasContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        diffCanvasContext.drawImage(defaultCanvas, 0, 0);
        this.addToUndoRedoStack();
    }

    duplicateDiffCanvas(): void {
        this.setPaintBrushMode();
        const defaultCanvas = this.defaultPaintArea.getPaintCanvas();
        const diffCanvas = this.diffPaintArea.getPaintCanvas();
        const defaultCanvasContext = defaultCanvas.getContext('2d') as CanvasRenderingContext2D;
        defaultCanvasContext.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        defaultCanvasContext.drawImage(diffCanvas, 0, 0);
        this.addToUndoRedoStack();
    }
}

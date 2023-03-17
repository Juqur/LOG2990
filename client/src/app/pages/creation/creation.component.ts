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
 * @author Simon Gagné
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

    setPaintBrushMode(): void {
        const defaultCtx = this.defaultPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;;
        const diffCtx = this.diffPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.creationService.paintBrushMode(defaultCtx, diffCtx);
    }

    setEraseBrushMode(): void {
        const defaultCtx = this.defaultPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;;
        const diffCtx = this.diffPaintArea.getPaintCanvas().getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.creationService.eraseBrushMode(defaultCtx, diffCtx);
    }

    findDifference(): void {
        const defaultCtx = this.defaultPaintArea.mergeCanvas().getContext('2d') as CanvasRenderingContext2D;;
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

        this.defaultPaintArea.getPaintCanvas().getContext('2d')?.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        this.diffPaintArea.getPaintCanvas().getContext('2d')?.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);

        this.defaultPaintArea.getPaintCanvas().getContext('2d')?.drawImage(canvas.defaultCanvas, 0, 0);
        this.diffPaintArea.getPaintCanvas().getContext('2d')?.drawImage(canvas.diffCanvas, 0, 0);
    }

    swapCanvas(): void {
        const defaultCanvas = this.defaultPaintArea.getPaintCanvas();
        const diffCanvas = this.diffPaintArea.getPaintCanvas();
        const tempCanvas = defaultCanvas.cloneNode() as HTMLCanvasElement;
        tempCanvas.getContext('2d')?.drawImage(defaultCanvas, 0, 0);
        defaultCanvas.getContext('2d')?.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        defaultCanvas.getContext('2d')?.drawImage(diffCanvas, 0, 0);
        diffCanvas.getContext('2d')?.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        diffCanvas.getContext('2d')?.drawImage(tempCanvas, 0, 0);
    }

    clearDefaultCanvas(): void {
        this.defaultPaintArea.getPaintCanvas().getContext('2d')?.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
    }

    clearDiffCanvas(): void {
        this.diffPaintArea.getPaintCanvas().getContext('2d')?.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
    }

    duplicateDefaultCanvas(): void {
        const defaultCanvas = this.defaultPaintArea.getPaintCanvas();
        const diffCanvas = this.diffPaintArea.getPaintCanvas();
        diffCanvas.getContext('2d')?.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        diffCanvas.getContext('2d')?.drawImage(defaultCanvas, 0, 0);
    }

    duplicateDiffCanvas(): void {
        const defaultCanvas = this.defaultPaintArea.getPaintCanvas();
        const diffCanvas = this.diffPaintArea.getPaintCanvas();
        defaultCanvas.getContext('2d')?.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        defaultCanvas.getContext('2d')?.drawImage(diffCanvas, 0, 0);
    }
    


}

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
            this.creationService.handleRedo();
        } else if ($event.ctrlKey && ($event.key === 'Z' || $event.key === 'z')) {
            this.creationService.handleUndo();
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
}

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
    sliderValue = Constants.SLIDER_DEFAULT;

    // eslint-disable-next-line max-params
    constructor(
        public creationService: CreationPageService,
    ) { }

    @HostListener('window:keydown ', ['$event'])
    onKeyPress($event: KeyboardEvent) {
        let canvas: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined;
        if ($event.ctrlKey && $event.shiftKey && $event.key === 'Z') {
            if (!UndoRedoService.isRedoStackEmpty()) {
                canvas = UndoRedoService.redo();
            }
        } else if ($event.ctrlKey && $event.key === 'z') {
            canvas = UndoRedoService.undo();
        }
        this.creationService.applyChanges(canvas);
    }

    ngOnDestroy(): void {
        UndoRedoService.resetAllStacks();
    }
}

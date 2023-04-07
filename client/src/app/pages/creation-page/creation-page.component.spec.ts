import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { RouterTestingModule } from '@angular/router/testing';
import { PaintAreaComponent } from '@app/components/paint-area/paint-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { CreationPageService } from '@app/services/creation-page/creation-page.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;

    let creationPageServiceSpy: jasmine.SpyObj<CreationPageService>;
    let ngAfterViewInitSpy: jasmine.Spy;
    let ngOnDestroySpy: jasmine.Spy;
    let addToUndoRedoStackSpy: jasmine.Spy;
    let setPaintBrushModeSpy: jasmine.Spy;
    let clearRectSpy: jasmine.Spy;
    let drawImageSpy: jasmine.Spy;

    beforeEach(() => {
        clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        creationPageServiceSpy = jasmine.createSpyObj('CreationPageService', [
            'paintBrushMode',
            'eraseBrushMode',
            'detectDifference',
            'saveFalse',
            'saveTrue',
            'brushSliderChange',
            'setBrushSize',
            'resetDefaultBackground',
            'resetDiffBackground',
        ]);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationPageComponent, ScaleContainerComponent, PaintAreaComponent],
            providers: [{ provide: CreationPageService, useValue: creationPageServiceSpy }, HttpClient, HttpHandler],
            imports: [AppMaterialModule, FormsModule, RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationPageComponent);
        component = fixture.componentInstance;

        ngAfterViewInitSpy = spyOn(component, 'ngAfterViewInit');
        ngOnDestroySpy = spyOn(component, 'ngOnDestroy');
        addToUndoRedoStackSpy = spyOn(component, 'addToUndoRedoStack');
        setPaintBrushModeSpy = spyOn(component, 'setPaintBrushMode');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onKeyPress', () => {
        let handleUndoSpy: jasmine.Spy;
        let handleRedoSpy: jasmine.Spy;

        beforeEach(() => {
            handleUndoSpy = spyOn(component, 'handleUndo');
            handleRedoSpy = spyOn(component, 'handleRedo');
        });

        it('should call handleUndo when ctrl+z is pressed', () => {
            const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'z' });
            component.onKeyPress(event);
            expect(handleUndoSpy).toHaveBeenCalledTimes(1);
            expect(handleRedoSpy).not.toHaveBeenCalled();
        });

        it('should call handleRedo when ctrl+shift+z is pressed', () => {
            const event = new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'z' });
            component.onKeyPress(event);
            expect(handleRedoSpy).toHaveBeenCalledTimes(1);
            expect(handleUndoSpy).not.toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit', () => {
        beforeEach(() => {
            creationPageServiceSpy.resetDefaultBackground.calls.reset();
            creationPageServiceSpy.resetDiffBackground.calls.reset();
            ngAfterViewInitSpy.and.callThrough();
            setPaintBrushModeSpy.calls.reset();
        });

        it('should call resetDefaultBackground', () => {
            component.ngAfterViewInit();
            expect(creationPageServiceSpy.resetDefaultBackground).toHaveBeenCalledTimes(1);
        });

        it('should call resetDiffBackground', () => {
            component.ngAfterViewInit();
            expect(creationPageServiceSpy.resetDiffBackground).toHaveBeenCalledTimes(1);
        });

        it('should call setPaintBrushMode', () => {
            component.ngAfterViewInit();
            expect(setPaintBrushModeSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('ngOnDestroy', () => {
        it('should call resetAllStacks', () => {
            const resetAllStacksSpy = spyOn(UndoRedoService, 'resetAllStacks');
            ngOnDestroySpy.and.callThrough();
            component.ngOnDestroy();
            expect(resetAllStacksSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('setBrushSize', () => {
        it('should call setBrushSize', () => {
            const defaultCtx = component.defaultPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            const diffCtx = component.diffPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            const matSlider = {} as unknown as MatSliderChange;
            component.setBrushSize(matSlider);
            expect(creationPageServiceSpy.brushSliderChange).toHaveBeenCalledWith(matSlider as unknown as MatSlider, defaultCtx, diffCtx);
        });
    });

    describe('setPaintBrushMode', () => {
        it('should call paintBrushMode', () => {
            setPaintBrushModeSpy.and.callThrough();
            const defaultCtx = component.defaultPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            const diffCtx = component.diffPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            component.setPaintBrushMode();
            expect(creationPageServiceSpy.paintBrushMode).toHaveBeenCalledWith(defaultCtx, diffCtx);
        });
    });

    describe('setEraseBrushMode', () => {
        it('should call eraseBrushMode', () => {
            const defaultCtx = component.defaultPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            const diffCtx = component.diffPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            component.setEraseBrushMode();
            expect(creationPageServiceSpy.eraseBrushMode).toHaveBeenCalledWith(defaultCtx, diffCtx);
        });
    });

    describe('findDifference', () => {
        it('should call detectDifference', () => {
            const defaultCtx = component.defaultPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            const diffCtx = component.diffPaintArea.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            component.findDifference();
            expect(creationPageServiceSpy.detectDifference).toHaveBeenCalledWith(defaultCtx, diffCtx);
        });
    });

    describe('addToUndoRedoStack', () => {
        let resetRedoStackSpy: jasmine.Spy;
        let addToStackSpy: jasmine.Spy;

        beforeEach(() => {
            resetRedoStackSpy = spyOn(UndoRedoService, 'resetRedoStack');
            addToStackSpy = spyOn(UndoRedoService, 'addToStack');
            addToUndoRedoStackSpy.and.callThrough();
        });

        it('should call saveFalse', () => {
            component.addToUndoRedoStack();
            expect(creationPageServiceSpy.saveFalse).toHaveBeenCalledTimes(1);
        });

        it('should call resetRedoStack', () => {
            component.addToUndoRedoStack();
            expect(resetRedoStackSpy).toHaveBeenCalledTimes(1);
        });

        it('should call addToStackSpy', () => {
            component.addToUndoRedoStack();
            expect(addToStackSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleUndo', () => {
        it('should call undo', () => {
            const applyChangesSpy = spyOn(component, 'applyChanges');
            const undoSpy = spyOn(UndoRedoService, 'undo');
            component.handleUndo();
            expect(undoSpy).toHaveBeenCalledTimes(1);
            expect(applyChangesSpy).toHaveBeenCalledWith(undoSpy.calls.mostRecent().returnValue);
        });
    });

    describe('handleRedo', () => {
        it('should call undo', () => {
            const applyChangesSpy = spyOn(component, 'applyChanges');
            const redoSpy = spyOn(UndoRedoService, 'redo');
            component.handleRedo();
            expect(redoSpy).toHaveBeenCalledTimes(1);
            expect(applyChangesSpy).toHaveBeenCalledWith(redoSpy.calls.mostRecent().returnValue);
        });
    });

    describe('applyChanges', () => {
        const canvas = { defaultCanvas: {} as unknown as HTMLCanvasElement, diffCanvas: {} as unknown as HTMLCanvasElement };

        beforeEach(() => {
            setPaintBrushModeSpy.calls.reset();
            creationPageServiceSpy.saveFalse.calls.reset();
        });

        it('should call saveFalse', () => {
            component.applyChanges(canvas);
            expect(creationPageServiceSpy.saveFalse).toHaveBeenCalledTimes(1);
        });

        it('should call setPaintBrushMode', () => {
            component.applyChanges(canvas);
            expect(setPaintBrushModeSpy).toHaveBeenCalledTimes(1);
        });

        it('should call clearRect', () => {
            component.applyChanges(canvas);
            expect(clearRectSpy).toHaveBeenCalledTimes(2);
        });

        it('should call drawImage', () => {
            component.applyChanges(canvas);
            expect(drawImageSpy).toHaveBeenCalledTimes(2);
        });

        it('should not call any other functions if canvas is undefined', () => {
            component.applyChanges(undefined);
            expect(creationPageServiceSpy.saveFalse).not.toHaveBeenCalled();
            expect(setPaintBrushModeSpy).not.toHaveBeenCalled();
            expect(clearRectSpy).not.toHaveBeenCalled();
            expect(drawImageSpy).not.toHaveBeenCalled();
        });
    });

    describe('onSwapCanvas', () => {
        beforeEach(() => {
            setPaintBrushModeSpy.calls.reset();
        });

        it('should call setPaintBrushMode', () => {
            component.onSwapCanvas();
            expect(setPaintBrushModeSpy).toHaveBeenCalledTimes(1);
        });

        it('should call clearRect', () => {
            component.onSwapCanvas();
            expect(clearRectSpy).toHaveBeenCalledTimes(2);
        });

        it('should call drawImage', () => {
            component.onSwapCanvas();
            expect(drawImageSpy).toHaveBeenCalledWith(component.defaultPaintArea.canvas, 0, 0);
            expect(drawImageSpy).toHaveBeenCalledWith(component.diffPaintArea.canvas, 0, 0);
            expect(drawImageSpy).toHaveBeenCalledWith(component.defaultPaintArea.canvas, 0, 0);
        });
    });

    describe('clearDefaultCanvas', () => {
        it('should call clearRect', () => {
            component.clearDefaultCanvas();
            expect(clearRectSpy).toHaveBeenCalledTimes(1);
        });

        it('should call addToUndoRedoStack', () => {
            component.clearDefaultCanvas();
            expect(addToUndoRedoStackSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('clearDiffCanvas', () => {
        it('should call clearRect', () => {
            component.clearDiffCanvas();
            expect(clearRectSpy).toHaveBeenCalledTimes(1);
        });

        it('should call addToUndoRedoStack', () => {
            component.clearDiffCanvas();
            expect(addToUndoRedoStackSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('duplicateDefaultCanvas', () => {
        it('should call addToUndoRedoStack', () => {
            component.duplicateDefaultCanvas();
            expect(addToUndoRedoStackSpy).toHaveBeenCalledTimes(1);
        });

        it('should call clearRect', () => {
            component.duplicateDefaultCanvas();
            expect(clearRectSpy).toHaveBeenCalledTimes(1);
        });

        it('should call drawImage', () => {
            component.duplicateDefaultCanvas();
            expect(drawImageSpy).toHaveBeenCalledTimes(1);
        });

        it('should call addToUndoRedoStack', () => {
            component.duplicateDefaultCanvas();
            expect(addToUndoRedoStackSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('duplicateDiffCanvas', () => {
        it('should call addToUndoRedoStack', () => {
            component.duplicateDiffCanvas();
            expect(addToUndoRedoStackSpy).toHaveBeenCalledTimes(1);
        });

        it('should call clearRect', () => {
            component.duplicateDiffCanvas();
            expect(clearRectSpy).toHaveBeenCalledTimes(1);
        });

        it('should call drawImage', () => {
            component.duplicateDiffCanvas();
            expect(drawImageSpy).toHaveBeenCalledTimes(1);
        });

        it('should call addToUndoRedoStack', () => {
            component.duplicateDiffCanvas();
            expect(addToUndoRedoStackSpy).toHaveBeenCalledTimes(1);
        });
    });
});

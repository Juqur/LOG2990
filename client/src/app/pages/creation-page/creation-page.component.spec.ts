/* eslint-disable max-lines */
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
import { Constants } from '@common/constants';
import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let creationPageServiceSpy: jasmine.SpyObj<CreationPageService>;
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;

    beforeEach(() => {
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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('pressing ctrl + z should call handleUndo', () => {
        const handleUndospy = spyOn(component, 'handleUndo').and.callThrough();
        const applyChangesSpy = spyOn(component, 'applyChanges');
        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'z' });
        window.dispatchEvent(event);
        expect(handleUndospy).toHaveBeenCalledTimes(1);
        expect(applyChangesSpy).toHaveBeenCalledTimes(1);
    });

    it('pressing ctrl + shift + z should call handleRedo', () => {
        const handleRedospy = spyOn(component, 'handleRedo').and.callThrough();
        const applyChangesSpy = spyOn(component, 'applyChanges');
        const event = new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'z' });
        window.dispatchEvent(event);
        expect(handleRedospy).toHaveBeenCalledTimes(1);
        expect(applyChangesSpy).toHaveBeenCalledTimes(1);
    });

    it('ngOnDestroy should call resetAllStacks', () => {
        const resetAllStacksSpy = spyOn(UndoRedoService, 'resetAllStacks');
        component.ngOnDestroy();
        expect(resetAllStacksSpy).toHaveBeenCalledTimes(1);
    });

    it('ngOnDestroy should call resetAllStacks', () => {
        const resetAllStacksSpy = spyOn(UndoRedoService, 'resetAllStacks');
        component.ngOnDestroy();
        expect(resetAllStacksSpy).toHaveBeenCalledTimes(1);
    });

    it('setPaintBrushMode should call paintBrushMode', () => {
        const defaultCtx = component.defaultPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = component.diffPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        component.setPaintBrushMode();
        expect(creationPageServiceSpy.paintBrushMode).toHaveBeenCalledWith(defaultCtx, diffCtx);
    });

    it('setEraseBrushMode should call eraseBrushMode', () => {
        const defaultCtx = component.defaultPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = component.diffPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        component.setEraseBrushMode();
        expect(creationPageServiceSpy.eraseBrushMode).toHaveBeenCalledWith(defaultCtx, diffCtx);
    });

    it('detectDifference should call detectDifference', () => {
        component.findDifference();
        expect(creationPageServiceSpy.detectDifference).toHaveBeenCalledTimes(1);
    });

    it('swapCanvas should swap the canvas', () => {
        spyOn(component, 'addToUndoRedoStack');
        const defaultCtx = component.defaultPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = component.diffPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        diffCtx.fillText('test', Constants.ten, Constants.ten);
        const defaultCanvasData = defaultCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        const diffCanvasData = diffCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        component.swapCanvas();
        expect(defaultCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT)).toEqual(diffCanvasData);
        expect(diffCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT)).toEqual(defaultCanvasData);
    });

    it('clearCanvas should clear the canvas', () => {
        spyOn(component, 'addToUndoRedoStack');
        const defaultCtx = component.defaultPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = component.diffPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        defaultCtx.fillText('test', Constants.ten, Constants.ten);
        component.clearDefaultCanvas();
        expect(defaultCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT)).toEqual(
            diffCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT),
        );
        diffCtx.fillText('test2', Constants.AREA_TO_DUPLICATE, Constants.AREA_TO_DUPLICATE);
        component.clearDiffCanvas();
        expect(diffCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT)).toEqual(
            defaultCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT),
        );
    });

    it('duplicateDefaultCanvas should duplicate the canvas on the diffCanvas', () => {
        spyOn(component, 'addToUndoRedoStack');
        const defaultCtx = component.defaultPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = component.diffPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        defaultCtx.fillText('test', Constants.ten, Constants.ten);
        diffCtx.fillText('test2', Constants.AREA_TO_DUPLICATE, Constants.AREA_TO_DUPLICATE);
        component.duplicateDefaultCanvas();
        expect(diffCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT)).toEqual(
            defaultCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT),
        );
    });

    it('duplicateDiffCanvas should duplicate the canvas on the defaultCanvas', () => {
        spyOn(component, 'addToUndoRedoStack');
        const defaultCtx = component.defaultPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = component.diffPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        defaultCtx.fillText('test', Constants.ten, Constants.ten);
        diffCtx.fillText('test2', Constants.AREA_TO_DUPLICATE, Constants.AREA_TO_DUPLICATE);
        component.duplicateDiffCanvas();
        expect(defaultCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT)).toEqual(
            diffCtx.getImageData(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT),
        );
    });

    it('addToUndoRedoStack should call resetRedoStack and addToStack', () => {
        const resetRedoStackSpy = spyOn(UndoRedoService, 'resetRedoStack');
        const addToStackSpy = spyOn(UndoRedoService, 'addToStack');
        component.addToUndoRedoStack();
        expect(creationPageServiceSpy.saveFalse).toHaveBeenCalledTimes(1);
        expect(resetRedoStackSpy).toHaveBeenCalledTimes(1);
        expect(addToStackSpy).toHaveBeenCalledTimes(1);
    });

    it('applyChanges should return undefined if canvas is undefined', () => {
        const defaultCanvas = document.createElement('canvas');
        const diffCanvas = document.createElement('canvas');
        const canvas = { defaultCanvas, diffCanvas };
        expect(component.applyChanges(canvas)).toBeUndefined();
    });

    it('applyChanges should call clearRect and drawImage', () => {
        const defaultCanvas = document.createElement('canvas');
        const diffCanvas = document.createElement('canvas');
        const defaultCtx = component.defaultPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = component.diffPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const canvas = { defaultCanvas, diffCanvas };

        spyOn(defaultCtx, 'clearRect');
        spyOn(diffCtx, 'clearRect');
        spyOn(defaultCtx, 'drawImage');
        spyOn(diffCtx, 'drawImage');

        component.applyChanges(canvas);
        expect(defaultCtx.clearRect).toHaveBeenCalledTimes(1);
        expect(diffCtx.clearRect).toHaveBeenCalledTimes(1);
        expect(defaultCtx.drawImage).toHaveBeenCalledTimes(1);
        expect(diffCtx.drawImage).toHaveBeenCalledTimes(1);
        expect(creationPageServiceSpy.saveFalse).toHaveBeenCalledTimes(1);
    });

    it('should not perform changes when canvas is undefined', () => {
        const defaultCtx = component.defaultPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = component.diffPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

        spyOn(defaultCtx, 'clearRect');
        spyOn(diffCtx, 'clearRect');
        spyOn(defaultCtx, 'drawImage');
        spyOn(diffCtx, 'drawImage');

        component.applyChanges(undefined);

        expect(defaultCtx.clearRect).not.toHaveBeenCalledWith(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        expect(diffCtx.clearRect).not.toHaveBeenCalledWith(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        expect(defaultCtx.drawImage).not.toHaveBeenCalled();
        expect(diffCtx.drawImage).not.toHaveBeenCalled();
    });

    it('setBrushSize should set the brush size', () => {
        const defaultCtx = component.defaultPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = component.diffPaintArea.paintCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const matSlider = { value: 1 } as MatSlider;
        const masSliderChange = { value: 1 } as MatSliderChange;
        component.setBrushSize(masSliderChange);
        expect(creationPageServiceSpy.brushSliderChange).toHaveBeenCalledWith(matSlider as MatSlider, defaultCtx, diffCtx);
    });
});

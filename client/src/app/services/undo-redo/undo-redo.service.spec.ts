import { TestBed } from '@angular/core/testing';
import { Constants } from '@common/constants';

import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {
    let service: UndoRedoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UndoRedoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add canvas to stack', () => {
        const defaultCanvas = document.createElement('canvas');
        const defaultCanvasCtx = defaultCanvas.getContext('2d');
        const tempDiffCanvas = document.createElement('canvas');
        const tempDiffCanvasCtx = tempDiffCanvas.getContext('2d');
        UndoRedoService.addToStack(defaultCanvasCtx as CanvasRenderingContext2D, tempDiffCanvasCtx as CanvasRenderingContext2D);
        expect(UndoRedoService.canvasStack.length).toEqual(1);
    });

    // it('addToStack should draw image', () => {
    //     // const defaultCanvas = document.createElement('canvas');
    //     // const defaultCanvasCtx = defaultCanvas.getContext('2d');
    //     // const diffCanvas = document.createElement('canvas');
    //     // const diffCanvasCtx = diffCanvas.getContext('2d');
    //     const defaultCanvasCtxDrawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
    //     const diffCanvasCtxDrawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');

    //     spyOn(UndoRedoService, 'addToStack').and.callThrough();

    //     expect(defaultCanvasCtxDrawImageSpy).toHaveBeenCalledTimes(1);
    //     expect(diffCanvasCtxDrawImageSpy).toHaveBeenCalledTimes(1);
    // });

    it('should undo', () => {
        const defaultCanvas = document.createElement('canvas');
        const defaultCanvasCtx = defaultCanvas.getContext('2d');
        const tempDiffCanvas = document.createElement('canvas');
        const tempDiffCanvasCtx = tempDiffCanvas.getContext('2d');
        UndoRedoService.addToStack(defaultCanvasCtx as CanvasRenderingContext2D, tempDiffCanvasCtx as CanvasRenderingContext2D);
        const action = UndoRedoService.undo();
        expect(action).not.toBeUndefined();
    });

    it('should not undo', () => {
        UndoRedoService.undoPointer = Constants.EMPTYSTACK;
        const action = UndoRedoService.undo();
        expect(action).toBeUndefined();
    });

    it('should redo', () => {
        const defaultCanvas = document.createElement('canvas');
        const defaultCanvasCtx = defaultCanvas.getContext('2d');
        const tempDiffCanvas = document.createElement('canvas');
        const tempDiffCanvasCtx = tempDiffCanvas.getContext('2d');
        UndoRedoService.addToStack(defaultCanvasCtx as CanvasRenderingContext2D, tempDiffCanvasCtx as CanvasRenderingContext2D);
        UndoRedoService.undo();
        const action = UndoRedoService.redo();
        expect(action).not.toBeUndefined();
    });

    it('should not redo', () => {
        UndoRedoService.redoPointer = Constants.EMPTYSTACK;
        const action = UndoRedoService.redo();
        expect(action).toBeUndefined();
    });

    it('should clear stack', () => {
        UndoRedoService.resetAllStacks();
        expect(UndoRedoService.canvasStack.length).toEqual(0);
        expect(UndoRedoService.redoStack.length).toEqual(0);
        expect(UndoRedoService.undoPointer).toEqual(Constants.EMPTYSTACK);
        expect(UndoRedoService.redoPointer).toEqual(Constants.EMPTYSTACK);
    });

    it('should clear undo stack', () => {
        UndoRedoService.resetUndoStack();
        expect(UndoRedoService.canvasStack.length).toEqual(0);
        expect(UndoRedoService.undoPointer).toEqual(Constants.EMPTYSTACK);
    });

    it('should clear redo stack', () => {
        UndoRedoService.resetRedoStack();
        expect(UndoRedoService.redoStack.length).toEqual(0);
        expect(UndoRedoService.redoPointer).toEqual(Constants.EMPTYSTACK);
    });

    it('isEmptyStack should return true', () => {
        UndoRedoService.resetAllStacks();
        expect(UndoRedoService.isRedoStackEmpty()).toBeTrue();
        expect(UndoRedoService.isUndoStackEmpty()).toBeTrue();
    });
});

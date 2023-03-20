import { TestBed } from '@angular/core/testing';
import { Constants } from '@common/constants';

import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {
    let service: UndoRedoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UndoRedoService);
        UndoRedoService.resetAllStacks();
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
        expect(UndoRedoService.canvasStack.length).toBeGreaterThanOrEqual(1);
    });

    it('addToStack should draw image', () => {
        spyOn(CanvasRenderingContext2D.prototype, 'drawImage');

        const defaultCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffCanvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        UndoRedoService.addToStack(defaultCtx, diffCanvas);

        expect(CanvasRenderingContext2D.prototype.drawImage).toHaveBeenCalledTimes(2);
    });

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

    // CE TEST NE MARCHE PAS 1 FOIS SUR 4 (POURQUOI?)
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

    it('should call drawImage with the correct arguments', () => {
        const spy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        const defaultCanvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffCanvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        UndoRedoService.addToStack(defaultCanvas, diffCanvas);

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy.calls.argsFor(0)).toEqual([defaultCanvas.canvas, 0, 0]);
        expect(spy.calls.argsFor(1)).toEqual([diffCanvas.canvas, 0, 0]);
    });

    it('when undoPointer is 0 on undo, undoPointer should be decremented', () => {
        UndoRedoService.undoPointer = 0;
        UndoRedoService.undo();
        expect(UndoRedoService.undoPointer).toEqual(Constants.minusOne);
    });

    it('when undoPointer is 0 on undo, undoStack.pop should be called', () => {
        UndoRedoService.undoPointer = 0;
        const undoStackPopSpy = spyOn(UndoRedoService.canvasStack, 'pop');
        UndoRedoService.undo();
        expect(undoStackPopSpy).toHaveBeenCalled();
    });

    it('when undoPointer is above 0 and when we call undo, undoPointer should be decremented', () => {
        UndoRedoService.undoPointer = 1;
        UndoRedoService.undo();
        expect(UndoRedoService.undoPointer).toEqual(0);
    });

    it('when undoPointer is above 0 and when we call undo, redostack.push should be called', () => {
        UndoRedoService.undoPointer = 1;
        const redoStackPushSpy = spyOn(UndoRedoService.redoStack, 'push');
        UndoRedoService.undo();
        expect(redoStackPushSpy).toHaveBeenCalled();
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

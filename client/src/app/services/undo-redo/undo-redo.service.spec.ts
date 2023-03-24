import { TestBed } from '@angular/core/testing';
import { Constants } from '@common/constants';

import { UndoRedoService } from './undo-redo.service';

fdescribe('UndoRedoService', () => {
    let service: UndoRedoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UndoRedoService);
        UndoRedoService.resetAllStacks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('addToStack', () => {
        let drawImageSpy: jasmine.Spy;

        beforeEach(() => {
            drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        });

        it('should add canvas to stack', () => {
            const defaultCanvas = document.createElement('canvas');
            const defaultCanvasCtx = defaultCanvas.getContext('2d');
            const tempDiffCanvas = document.createElement('canvas');
            const tempDiffCanvasCtx = tempDiffCanvas.getContext('2d');
            UndoRedoService.addToStack(defaultCanvasCtx as CanvasRenderingContext2D, tempDiffCanvasCtx as CanvasRenderingContext2D);
            expect(UndoRedoService.canvasStack.length).toBeGreaterThanOrEqual(1);
        });

        it('should still add to stack take the previous canvas if it has no context parameters', () => {
            const defaultCanvas = document.createElement('canvas');
            const defaultCanvasCtx = defaultCanvas.getContext('2d');
            const tempDiffCanvas = document.createElement('canvas');
            const tempDiffCanvasCtx = tempDiffCanvas.getContext('2d');
            UndoRedoService.addToStack(defaultCanvasCtx as CanvasRenderingContext2D, tempDiffCanvasCtx as CanvasRenderingContext2D);
            expect(UndoRedoService.canvasStack.length).toEqual(1);
            UndoRedoService.addToStack(null, null);
            expect(UndoRedoService.canvasStack.length).toEqual(2);
        });

        it('should create empty canvas if there is no parameters and the stack is empty', () => {
            const expectedCalls = 4;
            const mockCanvas = document.createElement('canvas');
            const createElementSpy = spyOn(document, 'createElement').and.returnValue(mockCanvas);
            UndoRedoService.addToStack(null, null);
            expect(UndoRedoService.canvasStack.length).toBeGreaterThanOrEqual(1);
            expect(createElementSpy).toHaveBeenCalledTimes(expectedCalls);
        });

        it('should draw image', () => {
            const defaultCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
            const diffCanvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
            UndoRedoService.addToStack(defaultCtx, diffCanvas);
            expect(drawImageSpy).toHaveBeenCalledTimes(2);
        });
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
        UndoRedoService.undoPointer = Constants.EMPTY_STACK;
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
        UndoRedoService.redoPointer = Constants.EMPTY_STACK;
        const action = UndoRedoService.redo();
        expect(action).toBeUndefined();
    });

    it('should clear stack', () => {
        UndoRedoService.resetAllStacks();
        expect(UndoRedoService.canvasStack.length).toEqual(0);
        expect(UndoRedoService.redoStack.length).toEqual(0);
        expect(UndoRedoService.undoPointer).toEqual(Constants.EMPTY_STACK);
        expect(UndoRedoService.redoPointer).toEqual(Constants.EMPTY_STACK);
    });

    it('should clear undo stack', () => {
        UndoRedoService.resetUndoStack();
        expect(UndoRedoService.canvasStack.length).toEqual(0);
        expect(UndoRedoService.undoPointer).toEqual(Constants.EMPTY_STACK);
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
        expect(UndoRedoService.redoPointer).toEqual(Constants.EMPTY_STACK);
    });

    describe('resetAllStacks', () => {
        let resetRedoStackSpy: jasmine.Spy;
        let resetUndoStackSpy: jasmine.Spy;

        beforeEach(() => {
            resetRedoStackSpy = spyOn(UndoRedoService, 'resetRedoStack');
            resetUndoStackSpy = spyOn(UndoRedoService, 'resetUndoStack');
        });

        it('should call resetUndoStackSpy', () => {
            UndoRedoService.resetAllStacks();
            expect(resetRedoStackSpy).toHaveBeenCalledTimes(1);
        });

        it('should call resetUndoStackSpy', () => {
            UndoRedoService.resetAllStacks();
            expect(resetUndoStackSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('isRedoStackEmpty', () => {
        it('should return true if redoStack is empty', () => {
            UndoRedoService.redoStack = [];
            expect(UndoRedoService.isRedoStackEmpty()).toBeTrue();
        });
    });

    describe('isUndoStackEmpty', () => {
        it('should return true if undoStack is empty', () => {
            UndoRedoService.undoPointer = -1;
            expect(UndoRedoService.isUndoStackEmpty()).toBeTrue();
        });
    });
});

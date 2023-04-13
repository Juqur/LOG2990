import { TestBed } from '@angular/core/testing';
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

        it('should still add to stack the previous canvas if it has no context parameters', () => {
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

    describe('undo', () => {
        it('should return undefined when undoPointer is -1', () => {
            UndoRedoService.undoPointer = -1;
            const action = UndoRedoService.undo();
            expect(action).toBeUndefined();
        });

        it('should return an empty canvas when undoPointer is 0', () => {
            const expectedCanvas = { defaultCanvas: document.createElement('canvas'), diffCanvas: document.createElement('canvas') };
            UndoRedoService.undoPointer = 0;
            const action = UndoRedoService.undo();
            expect(action).toEqual(expectedCanvas);
        });

        it('should return the action when undoPointer is superior than 0', () => {
            const defaultCanvas = {} as unknown as HTMLCanvasElement;
            const diffCanvas = {} as unknown as HTMLCanvasElement;
            UndoRedoService.undoPointer = 1;
            UndoRedoService.canvasStack.push({ defaultCanvas, diffCanvas });
            const action = UndoRedoService.undo();
            expect(action).toEqual({ defaultCanvas, diffCanvas });
        });
    });

    describe('redo', () => {
        const defaultCanvas = {} as unknown as HTMLCanvasElement;
        const diffCanvas = {} as unknown as HTMLCanvasElement;

        beforeEach(() => {
            UndoRedoService.redoStack = [];
            UndoRedoService.canvasStack = [];
            UndoRedoService.redoPointer = 0;
            UndoRedoService.undoPointer = 1;
            UndoRedoService.redoStack.push({ defaultCanvas, diffCanvas });
        });

        it('should return undefined when redoPointer is -1', () => {
            UndoRedoService.redoPointer = -1;
            const action = UndoRedoService.redo();
            expect(action).toBeUndefined();
        });

        it('should return the action', () => {
            const action = UndoRedoService.redo();
            expect(action).toEqual({ defaultCanvas, diffCanvas });
        });

        it('should increment the undo pointer', () => {
            const expectedUndoPointer = 2;
            UndoRedoService.redo();
            expect(UndoRedoService.undoPointer).toEqual(expectedUndoPointer);
        });

        it('should decrement the redo pointer', () => {
            const expectedRedoPointer = -1;
            UndoRedoService.redo();
            expect(UndoRedoService.redoPointer).toEqual(expectedRedoPointer);
        });
    });

    describe('resetRedoStack', () => {
        it('should clear redo stack correctly', () => {
            const expectedPointer = -1;
            UndoRedoService.resetRedoStack();
            expect(UndoRedoService.redoStack).toEqual([]);
            expect(UndoRedoService.redoPointer).toEqual(expectedPointer);
        });
    });

    describe('resetUndoStack', () => {
        it('should clear redo stack correctly', () => {
            const expectedPointer = -1;
            UndoRedoService.resetUndoStack();
            expect(UndoRedoService.canvasStack).toEqual([]);
            expect(UndoRedoService.undoPointer).toEqual(expectedPointer);
        });
    });

    describe('resetAllStacks', () => {
        let resetRedoStackSpy: jasmine.Spy;
        let resetUndoStackSpy: jasmine.Spy;

        beforeEach(() => {
            resetRedoStackSpy = spyOn(UndoRedoService, 'resetRedoStack');
            resetUndoStackSpy = spyOn(UndoRedoService, 'resetUndoStack');
        });

        it('should call resetRedoStackSpy', () => {
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

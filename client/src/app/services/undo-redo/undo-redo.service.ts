import { Injectable } from '@angular/core';
import { Constants } from '@common/constants';

/**
 * This service handles the undo and redo functionality of the creation page.
 *
 * @author Galen Hu & Simon Gagné
 * @class UndoRedoService
 */
@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    static canvasStack: { defaultCanvas: HTMLCanvasElement; differenceCanvas: HTMLCanvasElement }[] = [];
    static redoStack: { defaultCanvas: HTMLCanvasElement; differenceCanvas: HTMLCanvasElement }[] = [];
    static undoPointer: number = Constants.EMPTY_STACK;
    static redoPointer: number = Constants.EMPTY_STACK;

    /**
     * After the user has drawn on the canvas, we add the canvas to the stack.
     *
     * @param defaultCanvas The default (left) canvas.
     * @param differenceCanvas The diff (right) canvas.
     */
    static addToStack(defaultCanvas: CanvasRenderingContext2D | null, differenceCanvas: CanvasRenderingContext2D | null): void {
        if (!defaultCanvas) {
            defaultCanvas =
                this.undoPointer === Constants.EMPTY_STACK
                    ? (document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D)
                    : (this.canvasStack[this.undoPointer].defaultCanvas.getContext('2d') as CanvasRenderingContext2D);
        }
        if (!differenceCanvas) {
            differenceCanvas =
                this.undoPointer === Constants.EMPTY_STACK
                    ? (document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D)
                    : (this.canvasStack[this.undoPointer].differenceCanvas.getContext('2d') as CanvasRenderingContext2D);
        }
        const tempDefaultCanvas = document.createElement('canvas');
        tempDefaultCanvas.width = defaultCanvas.canvas.width;
        tempDefaultCanvas.height = defaultCanvas.canvas.height;
        const tempDefaultContext = tempDefaultCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempDefaultContext.drawImage(defaultCanvas.canvas, 0, 0);

        const tempDifferenceCanvas = document.createElement('canvas');
        tempDifferenceCanvas.width = differenceCanvas.canvas.width;
        tempDifferenceCanvas.height = differenceCanvas.canvas.height;
        const tempDifferenceContext = tempDifferenceCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempDifferenceContext.drawImage(differenceCanvas.canvas, 0, 0);

        this.canvasStack.push({ defaultCanvas: tempDefaultCanvas, differenceCanvas: tempDifferenceCanvas });
        this.undoPointer++;
    }

    /**
     * The undo function pops the last action from the stack and returns it.
     *
     * @returns The last action in the stack, or undefined if the stack is empty.
     */
    static undo(): { defaultCanvas: HTMLCanvasElement; differenceCanvas: HTMLCanvasElement } | undefined {
        if (this.undoPointer === 0) {
            const emptyCanvas = { defaultCanvas: document.createElement('canvas'), differenceCanvas: document.createElement('canvas') };
            this.undoPointer = -1;
            this.redoPointer++;
            this.redoStack.push(this.canvasStack.pop() as { defaultCanvas: HTMLCanvasElement; differenceCanvas: HTMLCanvasElement });
            return emptyCanvas;
        } else if (this.undoPointer > 0) {
            const action = this.canvasStack[--this.undoPointer];
            this.redoPointer++;
            this.redoStack.push(this.canvasStack.pop() as { defaultCanvas: HTMLCanvasElement; differenceCanvas: HTMLCanvasElement });
            return action;
        }
        return undefined;
    }

    /**
     * The redo function pops the last action from the redo stack and returns it.
     *
     * @returns The last action in the redo stack, or undefined if the stack is empty.
     */
    static redo(): { defaultCanvas: HTMLCanvasElement; differenceCanvas: HTMLCanvasElement } | undefined {
        if (this.redoPointer >= 0) {
            this.undoPointer++;
            const action = this.redoStack[this.redoPointer--];
            this.canvasStack.push(this.redoStack.pop() as { defaultCanvas: HTMLCanvasElement; differenceCanvas: HTMLCanvasElement });
            return action;
        }
        return undefined;
    }

    /**
     * Resets the redo stack to an empty array.
     */
    static resetRedoStack(): void {
        this.redoStack = [];
        this.redoPointer = Constants.EMPTY_STACK;
    }

    /**
     * Resets the undo stack to an empty array.
     */
    static resetUndoStack(): void {
        this.canvasStack = [];
        this.undoPointer = Constants.EMPTY_STACK;
    }

    /**
     * Resets both the undo and redo stacks to empty arrays.
     */
    static resetAllStacks(): void {
        this.resetRedoStack();
        this.resetUndoStack();
    }

    /**
     * Checks if the redo stack is empty.
     *
     * @returns True if the redo stack is empty, false otherwise.
     */
    static isRedoStackEmpty(): boolean {
        return this.redoStack.length === 0;
    }

    /**
     * Checks if the undo stack is empty.
     *
     * @returns True if the undo stack is empty, false otherwise.
     */
    static isUndoStackEmpty(): boolean {
        return this.undoPointer === Constants.EMPTY_STACK;
    }
}

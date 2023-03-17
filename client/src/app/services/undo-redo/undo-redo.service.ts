import { Injectable } from '@angular/core';
import { Constants } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    static canvasStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    static redoStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    static undoPointer: number = Constants.EMPTYSTACK;
    static redoPointer: number = Constants.EMPTYSTACK;

    /**
     * After the user has drawn on the canvas, we add the canvas to the stack.
     *
     * @param defaultCanvas the default (left) canvas
     * @param diffCanvas the diff (right) canvas
     */
    static addToStack(defaultCanvas: CanvasRenderingContext2D, diffCanvas: CanvasRenderingContext2D): void {
        const tempDefaultCanvas = document.createElement('canvas');
        tempDefaultCanvas.width = defaultCanvas.canvas.width;
        tempDefaultCanvas.height = defaultCanvas.canvas.height;
        const tempDefaultCtx = tempDefaultCanvas.getContext('2d');
        tempDefaultCtx?.drawImage(defaultCanvas.canvas, 0, 0);

        const tempDiffCanvas = document.createElement('canvas');
        tempDiffCanvas.width = diffCanvas.canvas.width;
        tempDiffCanvas.height = diffCanvas.canvas.height;
        const tempDiffCtx = tempDiffCanvas.getContext('2d');
        tempDiffCtx?.drawImage(diffCanvas.canvas, 0, 0);

        this.canvasStack.push({ defaultCanvas: tempDefaultCanvas, diffCanvas: tempDiffCanvas });
        this.undoPointer++;
    }

    /**
     * The undo function pops the last action from the stack and returns it.
     *
     * @returns the last action in the stack, or undefined if the stack is empty
     */
    static undo(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
        if (this.undoPointer === 0) {
            const emptyCanvas = { defaultCanvas: document.createElement('canvas'), diffCanvas: document.createElement('canvas') };
            this.undoPointer = -1;
            this.redoPointer++;
            this.redoStack.push(this.canvasStack.pop() as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement });
            return emptyCanvas;
        } else if (this.undoPointer > 0) {
            const action = this.canvasStack[--this.undoPointer];
            this.redoPointer++;
            this.redoStack.push(this.canvasStack.pop() as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement });
            return action;
        }
        return undefined;
    }

    /**
     * The redo function pops the last action from the redo stack and returns it.
     *
     * @returns the last action in the redo stack, or undefined if the stack is empty
     */
    static redo(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
        if (this.redoPointer >= 0) {
            this.undoPointer++;
            const action = this.redoStack[this.redoPointer--];
            this.canvasStack.push(this.redoStack.pop() as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement });
            return action;
        }
        return undefined;
    }

    /**
     * Resets the redo stack to an empty array.
     */
    static resetRedoStack(): void {
        this.redoStack = [];
        this.redoPointer = Constants.EMPTYSTACK;
    }

    /**
     * Resets the undo stack to an empty array.
     */
    static resetUndoStack(): void {
        this.canvasStack = [];
        this.undoPointer = Constants.EMPTYSTACK;
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
     * @returns true if the redo stack is empty, false otherwise
     */
    static isRedoStackEmpty(): boolean {
        return this.redoStack.length === 0;
    }

    /**
     * Checks if the undo stack is empty.
     *
     * @returns true if the undo stack is empty, false otherwise
     */
    static isUndoStackEmpty(): boolean {
        return this.undoPointer === Constants.EMPTYSTACK;
    }
}

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
        // this.actionStack.push({ defaultCanvas, diffCanvas });
        // if (this.pointer < this.actionStack.length - 1) {
        //     this.actionStack.splice(this.pointer + 1, this.actionStack.length - this.pointer);
        // }
        this.undoPointer++;
        this.print();
    }

    static undo(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
        if (this.undoPointer === 0) {
            const emptyCanvas = { defaultCanvas: document.createElement('canvas'), diffCanvas: document.createElement('canvas') };
            this.undoPointer = -1;
            this.redoPointer++;
            this.redoStack.push(this.canvasStack.pop() as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement });
            this.print();
            return emptyCanvas;
        } else if (this.undoPointer > 0) {
            const action = this.canvasStack[--this.undoPointer];
            this.redoPointer++;
            this.redoStack.push(this.canvasStack.pop() as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement });
            this.print();
            return action;
        }
        return undefined;
    }

    static redo(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
        if (this.redoPointer >= 0) {
            this.undoPointer++;
            const action = this.redoStack[this.redoPointer--];
            this.canvasStack.push(this.redoStack.pop() as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement });
            this.print();
            return action;
        }
        return undefined;
    }

    static resetRedoStack() {
        this.redoStack = [];
        this.redoPointer = Constants.EMPTYSTACK;
    }

    static resetUndoStack() {
        this.canvasStack = [];
        this.undoPointer = Constants.EMPTYSTACK;
    }

    static resetAllStacks() {
        this.resetRedoStack();
        this.resetUndoStack();
    }

    static resizeUndoStack() {
        this.canvasStack.length = this.undoPointer + 1;
    }

    static isRedoStackEmpty(): boolean {
        return this.redoStack.length === 0;
    }

    static isUndoStackEmpty(): boolean {
        return this.undoPointer === Constants.EMPTYSTACK;
    }

    static print() {
        console.log('canvasStack length : ' + this.canvasStack.length, this.canvasStack);
        console.log('redoStack length: ' + this.redoStack.length, this.redoStack);
        console.log('undoPointer: ' + this.undoPointer + '; redoPointer: ' + this.redoPointer);
    }
    // constructor() {}
}

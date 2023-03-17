import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    static canvasStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    static redoStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    static undoPointer: number = -1;
    stateStack: CanvasRenderingContext2D[] = [];

    static addToStack(defaultCanvas: CanvasRenderingContext2D, diffCanvas: CanvasRenderingContext2D) {
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
        console.log(this.canvasStack);
    }

    static undo(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
        // const action = this.canvasStack.pop();
        if (this.undoPointer <= 0) {
            this.undoPointer = -1;
            this.canvasStack = [];
            return { defaultCanvas: document.createElement('canvas'), diffCanvas: document.createElement('canvas') };
        }
        const action = this.canvasStack[--this.undoPointer];
        this.redoStack.push(this.canvasStack.pop() as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement });
        // this.redoStack.push(action);
        console.log(this.canvasStack);
        return action;
    }

    static redo(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
        const action = this.redoStack.pop();
        this.canvasStack.push(action as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement });
        this.undoPointer++;
        console.log(this.canvasStack);
        return action;
    }

    static resetRedoStack() {
        this.redoStack = [];
    }

    static resizeUndoStack() {
        this.canvasStack.length = this.undoPointer + 1;
    }

    static isRedoStackEmpty(): boolean {
        return this.redoStack.length === 0;
    }
    // constructor() {}

    // addToStack(defaultCanvas: HTMLCanvasElement, diffCanvas: HTMLCanvasElement) {
    //     this.actionStack.push({ defaultCanvas, diffCanvas });
    //     console.log(this.actionStack);
    // }

    // addState(state: CanvasRenderingContext2D) {
    //     this.stateStack.push(state);
    //     console.log(this.stateStack);
    // }
}

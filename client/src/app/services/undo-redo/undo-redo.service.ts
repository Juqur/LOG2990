import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    static canvasStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    static redoStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    static pointer: number = -1;
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
        this.pointer++;
        console.log(this.canvasStack, this.pointer);
    }

    static undo(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
        // const action = this.canvasStack.pop();
        if (this.pointer <= 0) {
            return { defaultCanvas: document.createElement('canvas'), diffCanvas: document.createElement('canvas') };
        }
        const action = this.canvasStack[--this.pointer];
        // this.redoStack.push(this.canvasStack.pop() as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement });
        console.log('undo ', this.pointer);
        console.log(this.canvasStack);
        console.log(this.canvasStack[this.pointer]);
        console.log(this.redoStack);
        return action;
    }

    static redo() {
        console.log('redo');
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

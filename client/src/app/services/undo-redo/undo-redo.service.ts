import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    static actionStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    // actionStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    stateStack: CanvasRenderingContext2D[] = [];
    static pointer: number = -1;

    static addToStack(defaultCanvas: HTMLCanvasElement, diffCanvas: HTMLCanvasElement) {
        this.actionStack.push({ defaultCanvas, diffCanvas });
        this.pointer++;
        console.log(this.actionStack);
    }

    static undo() {
        this.pointer--;
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

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    // constructor() {}
    actionStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    stateStack: string[] = [];

    addToStack(defaultCanvas: HTMLCanvasElement, diffCanvas: HTMLCanvasElement) {
        this.actionStack.push({ defaultCanvas, diffCanvas });
        console.log(this.actionStack);
    }

    addState(state: string) {
        this.stateStack.push(state);
        console.log(this.stateStack);
    }
}

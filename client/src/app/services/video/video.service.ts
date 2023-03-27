/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class VideoService {
    static videoStack: { mousePosition: number; clickedOnOriginal: boolean }[] = [];
    // constructor() {}

    /**
     * After a click has been perform on the canvas,
     * this method will add the click position and the canvas that was clicked on to the stack.
     *
     * @param mousePosition The position of the mouse when the click was performed.
     * @param clickedOnOriginal The canvas that was clicked on (true is original and false is different).
     */
    static addToStack(mousePosition: number, clickedOnOriginal: boolean): void {
        VideoService.videoStack.push({ mousePosition, clickedOnOriginal });
        console.log(VideoService.videoStack);
    }

    static popStack(): { mousePosition: number; clickedOnOriginal: boolean } | undefined {
        if (!this.isStackEmpty()) {
            return VideoService.videoStack.pop();
        } else {
            return undefined;
        }
    }

    static resetStack(): void {
        VideoService.videoStack = [];
    }

    static isStackEmpty(): boolean {
        return VideoService.videoStack.length === 0;
    }
}

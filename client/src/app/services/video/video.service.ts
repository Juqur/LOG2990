/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';

@Injectable({
    providedIn: 'root',
})
export class VideoService {
    static videoStack: { mousePosition: number; clickedOnOriginal: boolean }[] = [];
    static videoReplayStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    static gamePageStack: {
        originalCanvas: PlayAreaComponent;
        diffCanvas: PlayAreaComponent;
        timestamp: Date;
        chat: string;
        gameEnded: boolean;
        isWinning: boolean;
    }[] = [];

    static firstPlayerName: string;
    static secondPlayerName: string;
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

    static addGamePageToStack(defaultCanvas: CanvasRenderingContext2D | null, diffCanvas: CanvasRenderingContext2D | null) {
        if (!defaultCanvas) {
            defaultCanvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        }
        if (!diffCanvas) {
            diffCanvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        }

        const tempDefaultCanvas = document.createElement('canvas');
        tempDefaultCanvas.width = defaultCanvas.canvas.width;
        tempDefaultCanvas.height = defaultCanvas.canvas.height;
        const tempDefaultCtx = tempDefaultCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempDefaultCtx.drawImage(defaultCanvas.canvas, 0, 0);

        const tempDiffCanvas = document.createElement('canvas');
        tempDiffCanvas.width = diffCanvas.canvas.width;
        tempDiffCanvas.height = diffCanvas.canvas.height;
        const tempDiffCtx = tempDiffCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempDiffCtx.drawImage(diffCanvas.canvas, 0, 0);

        this.videoReplayStack.push({ defaultCanvas: defaultCanvas.canvas, diffCanvas: diffCanvas.canvas });
    }

    static popStack(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
        if (!this.isStackEmpty()) {
            return VideoService.videoReplayStack.pop();
        } else {
            return undefined;
        }
    }

    static resetStack(): void {
        VideoService.videoStack = [];
    }

    static isStackEmpty(): boolean {
        // return VideoService.videoStack.length === 0;
        return VideoService.videoReplayStack.length === 0;
    }

    static setVariables(firstPlayerName: string, secondPlayerName: string): void {
        this.firstPlayerName = firstPlayerName;
        this.secondPlayerName = secondPlayerName;
    }

    static getFirstPlayerName(): string {
        console.log(VideoService.firstPlayerName);
        return VideoService.firstPlayerName;
    }

    static getSecondPlayerName(): string {
        console.log(VideoService.secondPlayerName);
        return VideoService.secondPlayerName;
    }
}

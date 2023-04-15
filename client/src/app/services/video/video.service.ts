/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';

@Injectable({
    providedIn: 'root',
})
export class VideoService {
    static videoStack: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];
    static gamePageStack: {
        originalCanvas: PlayAreaComponent;
        diffCanvas: PlayAreaComponent;
        timestamp: Date;
        chat: string;
        gameEnded: boolean;
        isWinning: boolean;
    }[] = [];
    static pointer = 0;

    static firstPlayerName: string;
    static secondPlayerName: string;

    static addToVideoStack(defaultCanvas: CanvasRenderingContext2D | null, diffCanvas: CanvasRenderingContext2D | null) {
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

        this.videoStack.push({ defaultCanvas: defaultCanvas.canvas, diffCanvas: diffCanvas.canvas });
        console.log(this.videoStack);
    }

    static popStack(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
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
        // return VideoService.videoStack.length === 0;
        return VideoService.videoStack.length === 0;
    }

    static setVariables(firstPlayerName: string, secondPlayerName: string): void {
        this.firstPlayerName = firstPlayerName;
        this.secondPlayerName = secondPlayerName;
    }

    static getFirstPlayerName(): string {
        return VideoService.firstPlayerName;
    }

    static getSecondPlayerName(): string {
        return VideoService.secondPlayerName;
    }
}

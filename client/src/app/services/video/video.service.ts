/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimerService } from '@app/services/timer/timer.service';
import { ChatMessage } from '@common/interfaces/chat-messages';

@Injectable({
    providedIn: 'root',
})
export class VideoService {
    static videoLog: string[] = [];
    static messageStack: { chatMessage: ChatMessage; time: number }[] = [];
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

    static stackCounter = 0;

    private static videoStack: { time: number; found: boolean; defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }[] = [];

    // eslint-disable-next-line max-params
    static addToVideoStack(time: number, found: boolean = false, defaultCanvas: CanvasRenderingContext2D, diffCanvas: CanvasRenderingContext2D) {
        const tempDefaultCanvas = document.createElement('canvas');
        tempDefaultCanvas.width = defaultCanvas.canvas.width;
        tempDefaultCanvas.height = defaultCanvas.canvas.height;
        const tempDefaultContext = tempDefaultCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempDefaultContext.drawImage(defaultCanvas.canvas, 0, 0);

        const tempDiffCanvas = document.createElement('canvas');
        tempDiffCanvas.width = diffCanvas.canvas.width;
        tempDiffCanvas.height = diffCanvas.canvas.height;
        const tempDiffContext = tempDiffCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempDiffContext.drawImage(diffCanvas.canvas, 0, 0);

        this.videoStack.push({ time, found, defaultCanvas: tempDefaultCanvas, diffCanvas: tempDiffCanvas });
        console.table(this.videoStack);
    }

    static popStack(): { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined {
        if (!this.isStackEmpty()) {
            return VideoService.videoStack.pop(); //
        } else {
            return undefined;
        }
    }

    static resetStack(): void {
        VideoService.videoStack = [];
        VideoService.messageStack = [];
    }

    static isStackEmpty(): boolean {
        return VideoService.videoStack.length === 0; //
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

    static addToLog(message: string): void {
        this.videoLog.push(message);
    }

    static getStackElement(index: number): { time: number; found: boolean; defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } {
        return this.videoStack[index];
    }

    static getMessagesStackElement(index: number): { chatMessage: ChatMessage; time: number } {
        return this.messageStack[index];
    }

    static getStackLength(): number {
        return this.videoStack.length;
    }

    static addMessageToStack(message: ChatMessage): void {
        this.messageStack.push({ chatMessage: message, time: TimerService.timerValue });
        console.table(this.messageStack);
    }
}

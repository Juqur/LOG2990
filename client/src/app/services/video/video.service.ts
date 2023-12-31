import { Injectable } from '@angular/core';
import { TimerService } from '@app/services/timer/timer.service';
import { ChatMessage } from '@common/interfaces/chat-messages';

@Injectable({
    providedIn: 'root',
})
export class VideoService {
    static videoLog: string[] = [];
    static messageStack: { chatMessage: ChatMessage; time: number }[] = [];
    static pointer = 0;
    static firstPlayerName: string;
    static secondPlayerName: string;
    static isWinning: boolean;

    static stackCounter = 0;

    private static videoStack: {
        time: number;
        found: boolean;
        playerDifferencesCount: number;
        secondPlayerDifferencesCount: number;
        defaultCanvas: HTMLCanvasElement;
        diffCanvas: HTMLCanvasElement;
    }[] = [];

    // eslint-disable-next-line max-params
    static addToVideoStack(
        time: number,
        playerDifferencesCount: number,
        secondPlayerDifferencesCount: number,
        defaultCanvas: CanvasRenderingContext2D,
        diffCanvas: CanvasRenderingContext2D,
        found: boolean = false,
    ) {
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

        this.videoStack.push({
            time,
            found,
            playerDifferencesCount,
            secondPlayerDifferencesCount,
            defaultCanvas: tempDefaultCanvas,
            diffCanvas: tempDiffCanvas,
        });
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
        VideoService.messageStack = [];
    }

    static isStackEmpty(): boolean {
        return VideoService.videoStack.length === 0;
    }

    static setVariables(firstPlayerName: string, secondPlayerName: string, isWinning: boolean): void {
        this.firstPlayerName = firstPlayerName;
        this.secondPlayerName = secondPlayerName;
        this.isWinning = isWinning;
    }

    static getFirstPlayerName(): string {
        return VideoService.firstPlayerName;
    }

    static getSecondPlayerName(): string {
        return VideoService.secondPlayerName;
    }

    static getStackElement(index: number): {
        time: number;
        found: boolean;
        playerDifferencesCount: number;
        secondPlayerDifferencesCount: number;
        defaultCanvas: HTMLCanvasElement;
        diffCanvas: HTMLCanvasElement;
    } {
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
    }
}

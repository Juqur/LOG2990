import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class TimerService {
    private timeMap = new Map<string, number>();
    private timeIntervalMap = new Map<string, NodeJS.Timeout>();

    /**
     * Gets game time
     */
    getTime(socketId): number {
        return this.timeMap.get(socketId);
    }

    /**
     * Starts a timer for both single player and multiplayer games.
     * It starts the the timer at 0 for classic games and at 120 for timed games.
     * Creates an interval that emits the time to the player every second.
     *
     * @param socket The socket of the player who is used to start the timer.
     * @param server The server that is used to emit the time to the player.
     * @param isClassic Boolean value that determines if the game is classic or timed.
     * @param otherSocketId The socket id of the other player.
     */
    // eslint-disable-next-line max-params
    startTimer(socketId: string, server: Server, isClassic: boolean, otherSocketId?: string): void {
        this.timeMap.set(socketId, isClassic ? 0 : Constants.TIMED_GAME_MODE_LENGTH);
        const interval = setInterval(() => {
            const time = this.timeMap.get(socketId);
            server.to(socketId).emit('sendTime', time);
            if (otherSocketId) {
                server.to(otherSocketId).emit('sendTime', time);
            }
            this.timeMap.set(socketId, isClassic ? time + 1 : time - 1);
        }, Constants.millisecondsInOneSecond);

        this.timeIntervalMap.set(socketId, interval);
        if (otherSocketId) {
            this.timeIntervalMap.set(otherSocketId, interval);
        }
    }

    /**
     * Stops the timer for both single player and multiplayer games.
     * Deletes the interval and the time of the player in the maps.
     *
     * @param socket The socket of the player who is used to stop the timer.
     */
    stopTimer(socketId: string): void {
        const interval = this.timeIntervalMap.get(socketId);
        if (interval) {
            clearInterval(interval);
        }
        this.timeIntervalMap.delete(socketId);
        this.timeMap.delete(socketId);
    }

    /**
     * Adds time to the timer of a player.
     *
     * @param socket The socket of the player who is used to add time to the timer.
     * @param time The time that is added to the timer.
     */
    addTime(socketId: string, time: number): void {
        const currentTime = this.timeMap.get(socketId);
        if (currentTime) {
            this.timeMap.set(socketId, currentTime + time);
        }
    }

    /**
     * Removes time of the timer of a player.
     *
     * @param socket The socket of the player who is used to add time to the timer.
     * @param time The time that is removed to the timer.
     */
    subtractTime(socketId: string, time: number): void {
        const currentTime = this.timeMap.get(socketId);
        if (currentTime) {
            this.timeMap.set(socketId, currentTime - time);
        }
    }
}

import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class TimerService {
    private timeMap = new Map<string, number>();
    private timeIntervalMap = new Map<string, NodeJS.Timeout>();

    /**
     * Starts a timer for both single player and multiplayer games
     * It starts the the timer at 0 for classic games and at 120 for timed games
     * Creates an interval that emits the time to the player every second
     *
     * @param socket The socket of the player who is used to start the timer
     * @param isClassic Boolean value that determines if the game is classic or timed
     */
    startTimer(socketId: string, server: Server, isClassic: boolean): void {
        console.log('startTimer');
        this.timeMap.set(socketId, isClassic ? 0 : Constants.TIMED_GAME_MODE_LENGTH);
        const interval = setInterval(() => {
            const time = this.timeMap.get(socketId);
            server.to(socketId).emit('sendTime', time);
            this.timeMap.set(socketId, isClassic ? time + 1 : time - 1);
        }, Constants.millisecondsInOneSecond);
        this.timeIntervalMap.set(socketId, interval);
    }

    /**
     * Stops the timer for both single player and multiplayer games
     * Deletes the interval and the time of the player in the maps
     *
     * @param socket The socket of the player who is used to stop the timer
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
     * Adds a given time the timer of a player
     *
     * @param socket The socket of the player who is used to add time to the timer
     * @param time The time that is added to the timer
     */
    addTime(socketId: string, time: number): void {
        const currentTime = this.timeMap.get(socketId);
        if (currentTime) {
            this.timeMap.set(socketId, currentTime + time);
        }
    }

    /**
     * Removes a given time the timer of a player
     *
     * @param socket The socket of the player who is used to add time to the timer
     * @param time The time that is removed to the timer
     */
    removeTime(socketId: string, time: number): void {
        const currentTime = this.timeMap.get(socketId);
        if (currentTime) {
            this.timeMap.set(socketId, currentTime - time);
        }
    }
}

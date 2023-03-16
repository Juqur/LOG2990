import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

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
    startTimer(socket: Socket, isClassic: boolean): void {
        this.timeMap.set(socket.id, isClassic ? 0 : Constants.TIMED_GAME_MODE_LENGTH);
        const interval = setInterval(() => {
            this.timeMap.forEach((value, key) => {
                socket.to(key).emit('time', value);
                this.timeMap.set(key, isClassic ? value + 1 : value - 1);
            });
        }, Constants.millisecondsInOneSecond);
        this.timeIntervalMap.set(socket.id, interval);
    }

    /**
     * Stops the timer for both single player and multiplayer games
     * Deletes the interval and the time of the player in the maps
     *
     * @param socket The socket of the player who is used to stop the timer
     */
    stopTimer(socket: Socket): void {
        const interval = this.timeIntervalMap.get(socket.id);
        if (interval) {
            clearInterval(interval);
        }
        this.timeIntervalMap.delete(socket.id);
        this.timeMap.delete(socket.id);
    }

    /**
     * Adds a given time the timer of a player
     *
     * @param socket The socket of the player who is used to add time to the timer
     * @param time The time that is added to the timer
     */
    addTime(socket: Socket, time: number): void {
        const currentTime = this.timeMap.get(socket.id);
        if (currentTime) {
            this.timeMap.set(socket.id, currentTime + time);
        }
    }

    /**
     * Removes a given time the timer of a player
     *
     * @param socket The socket of the player who is used to add time to the timer
     * @param time The time that is removed to the timer
     */
    removeTime(socket: Socket, time: number): void {
        const currentTime = this.timeMap.get(socket.id);
        if (currentTime) {
            this.timeMap.set(socket.id, currentTime - time);
        }
    }
}

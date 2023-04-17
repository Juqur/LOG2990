import { GameEvents } from '@app/gateways/game/game.gateway.events';
import { GameService } from '@app/services/game/game.service';
import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class TimerService {
    private timeMap = new Map<string, number>();
    private timeIntervalMap = new Map<string, NodeJS.Timeout>();

    constructor(private gameService: GameService) {}

    /**
     * Gets the game time.
     */
    getTime(socketId: string): number {
        return this.timeMap.get(socketId);
    }

    /**
     * Gets the game time
     */
    getTime(socketId): number {
        return this.timeMap.get(socketId);
    }

    /**
     * Starts a timer for both single player and multiplayer games.
     * It starts the the timer at 0 for classic games and at 120 for timed games.
     * Creates an interval that emits the time to the player every second.
     * If the game is timed, the timer will stop at 0 and emit to the player that the game is over.
     *
     * @param socket The socket of the player who is used to start the timer.
     * @param server The server that is used to emit the time to the player.
     * @param isClassic Boolean value that determines if the game is classic or timed.
     * @param otherSocketId The socket id of the other player.
     */
    startTimer(sockets: { socket: Socket; otherSocketId?: string }, server: Server, isClassic: boolean): void {
        const socketId = sockets.socket.id;
        this.timeMap.set(socketId, isClassic ? 0 : Constants.TIMED_GAME_MODE_LENGTH);
        const interval = setInterval(() => {
            const time = this.timeMap.get(socketId);
            if (sockets.otherSocketId) {
                server.to(sockets.otherSocketId).emit(GameEvents.SendTime, time);
            }
            this.timeMap.set(socketId, isClassic ? time + 1 : time - 1);
            if (!isClassic && time === 0) {
                this.stopTimer(socketId);
                const levelId = this.gameService.getGameState(socketId).levelId;
                this.gameService.removeLevel(levelId, true);
                this.gameService.deleteUserFromGame(sockets.socket);
                server.to(socketId).emit(GameEvents.TimedModeFinished, false);
                clearInterval(interval);
            }
            server.to(socketId).emit(GameEvents.SendTime, time);
        }, Constants.millisecondsInOneSecond);

        this.timeIntervalMap.set(socketId, interval);
        if (sockets.otherSocketId) {
            this.timeIntervalMap.set(sockets.otherSocketId, interval);
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
     * @param server The server that is used to emit the time to the player.
     * @param socketId The if of the socket of the player who is used to add time to the timer.
     * @param time The time that is added to the timer.
     */
    addTime(server: Server, socketId: string, time: number): void {
        const currentTime = this.timeMap.get(socketId);
        if (currentTime) {
            if (this.gameService.getGameState(socketId).timedLevelList && currentTime + time > Constants.TIMED_GAME_MODE_LENGTH) {
                time = Constants.TIMED_GAME_MODE_LENGTH - currentTime;
            }
            server.to(socketId).emit('sendTime', currentTime + time);
            this.timeMap.set(socketId, currentTime + time);
        }
    }

    /**
     * Removes time of the timer of a player.
     *
     * @param server The server that is used to emit the time to the player.
     * @param socket The id of the socket of the player who is used to add time to the timer.
     * @param time The time that is removed to the timer.
     */
    subtractTime(server: Server, socketId: string, time: number): void {
        const currentTime = this.timeMap.get(socketId);
        if (currentTime) {
            if (currentTime - time < 0) {
                time = currentTime;
            }
            server.to(socketId).emit('sendTime', currentTime - time);
            this.timeMap.set(socketId, currentTime - time);
        }
    }

    /**
     * Returns the current time of the timer of a player.
     * If the player does not have a timer, it returns 0.
     *
     * @param socket The socket of the player.
     * @returns The current time of the timer as a number.
     */
    getCurrentTime(socketId: string): number {
        return this.timeMap.get(socketId) ?? 0;
    }
}

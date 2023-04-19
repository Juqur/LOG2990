import { GameEvents } from '@app/gateways/game/game.gateway.events';
import { GameService } from '@app/services/game/game.service';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class TimerService {
    private timeMap = new Map<string, { time: number; startDate: Date }>();
    private timeIntervalMap = new Map<string, NodeJS.Timeout>();

    constructor(private gameService: GameService, private mongoDbService: MongodbService) {}

    /**
     * Gets the game time.
     */
    getTime(socketId: string): number {
        return this.timeMap.get(socketId).time;
    }

    /**
     * Gets the start date.
     *
     * @param socketId The socket id of the associated player.
     * @returns The start date.
     */
    getStartDate(socketId: string): Date {
        return this.timeMap.get(socketId).startDate;
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
        const startDate = new Date();
        this.timeMap.set(socketId, { time: isClassic ? 0 : this.gameService.getGameState(socketId).timedGameLength, startDate });
        const interval = setInterval(() => {
            const time = this.timeMap.get(socketId);
            this.timeMap.set(socketId, { time: isClassic ? time.time + 1 : time.time - 1, startDate: time.startDate });
            sockets.socket.emit(GameEvents.SendTime, time.time);
            if (sockets.otherSocketId) {
                this.timeMap.set(sockets.otherSocketId, { time: isClassic ? time.time + 1 : time.time - 1, startDate: time.startDate });
                server.sockets.sockets.get(sockets.otherSocketId).emit(GameEvents.SendTime, time.time);
            }
            if (!isClassic && time.time === 0) {
                const gameState = this.gameService.getGameState(socketId);
                this.mongoDbService
                    .addGameHistory({
                        startDate: this.timeMap.get(socketId).startDate,
                        lengthGame: Math.ceil(
                            (new Date().getTime() - this.timeMap.get(socketId).startDate.getTime()) / Constants.millisecondsInOneSecond,
                        ),
                        isClassic: !gameState.timedLevelList,
                        firstPlayerName: gameState.playerName,
                        secondPlayerName: gameState.otherSocketId ? this.gameService.getGameState(gameState.otherSocketId).playerName : undefined,
                        hasPlayerAbandoned: false,
                    })
                    .then();
                this.stopTimer(socketId);
                this.gameService.removeLevel(gameState.levelId, false);
                this.gameService.deleteUserFromGame(sockets.socket);
                server.to(socketId).emit(GameEvents.TimedModeFinished, false);
                clearInterval(interval);
            }
        }, Constants.millisecondsInOneSecond);
        this.timeIntervalMap.set(socketId, interval);
        if (sockets.otherSocketId) {
            this.timeMap.set(sockets.otherSocketId, { time: isClassic ? 0 : Constants.TIMED_GAME_MODE_LENGTH, startDate });
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
            this.timeIntervalMap.delete(socketId);
            this.timeMap.delete(socketId);
        } else {
            const gameState = this.gameService.getGameState(socketId);
            if (!gameState) return;
            const otherSocketId = gameState.otherSocketId;
            if (otherSocketId) {
                const otherInterval = this.timeIntervalMap.get(otherSocketId);
                if (otherInterval) {
                    clearInterval(otherInterval);
                }
                this.timeIntervalMap.delete(otherSocketId);
                this.timeMap.delete(otherSocketId);
            }
        }
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
            let newTime = currentTime.time + time;
            if (this.gameService.getGameState(socketId).timedLevelList && newTime > Constants.TIMED_GAME_MODE_LENGTH) {
                newTime = Constants.TIMED_GAME_MODE_LENGTH;
            }
            if (this.gameService.getGameState(socketId).timedLevelList && newTime < 0) {
                newTime = 0;
            }
            server.sockets.sockets.get(socketId).emit('sendExtraTime', newTime);
            this.timeMap.set(socketId, { time: newTime, startDate: currentTime.startDate });
            const otherSocketId = this.gameService.getGameState(socketId).otherSocketId;
            if (otherSocketId) {
                server.sockets.sockets.get(otherSocketId).emit('sendExtraTime', newTime);
                this.timeMap.set(otherSocketId, { time: newTime, startDate: currentTime.startDate });
            }
            server.sockets.sockets.get(socketId).emit('sendTime', newTime);
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
        return this.timeMap.get(socketId) ? this.timeMap.get(socketId).time : 0;
    }
}

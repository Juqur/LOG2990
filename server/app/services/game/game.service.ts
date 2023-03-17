import { ImageService } from '@app/services/image/image.service';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface GameData {
    differencePixels: number[];
    totalDifferences: number;
    amountOfDifferencesFound: number;
    amountOfDifferencesFoundSecondPlayer?: number;
}

export interface GameState {
    gameId: number;
    foundDifferences: number[];
    playerName: string;
    secondPlayerId?: string;
    waitingForSecondPlayer?: boolean;
    isInGame?: boolean;
}

export enum VictoryType {
    SoloClassic = 'SoloClassic',
    MultiplayerClassic = 'MultiplayerClassic',
}

/**
 * This service is used to handle the game logic.
 *
 * @author Junaid Qureshi
 * @class GameService
 */
@Injectable()
export class GameService {
    private playerGameMap = new Map<string, GameState>();
    private levelDeletionQueue: number[] = [];

    constructor(private imageService: ImageService) {}

    /**
     * This method is called when a player clicks on a pixel.
     * It uses imageService to detect whether the pixel is a difference pixel.
     *
     * @param socketId The socket id of the player.
     * @param position  The position of the pixel that was clicked.
     * @returns A GameState object containing the game data.
     */
    async getImageInfoOnClick(socketId: string, position: number): Promise<GameData> {
        const gameState = this.playerGameMap.get(socketId);
        const id: string = gameState.gameId as unknown as string;
        const response = await this.imageService.findDifference(id, gameState.foundDifferences, position);
        return {
            differencePixels: response.differencePixels,
            totalDifferences: response.totalDifferences,
            amountOfDifferencesFound: gameState.foundDifferences.length,
        };
    }

    verifyWinCondition(socket: Socket, server: Server, totalDifferences: number): boolean {
        const gameState = this.playerGameMap.get(socket.id);
        if (gameState.secondPlayerId && gameState.foundDifferences.length >= Math.ceil(totalDifferences / 2)) {
            this.deleteUserFromGame(socket);
            this.deleteUserFromGame(server.sockets.sockets.get(gameState.secondPlayerId));
            this.removeLevelToDeletionQueue(gameState.gameId);
            return true;
        } else if (gameState.foundDifferences.length === totalDifferences) {
            this.deleteUserFromGame(socket);
            this.removeLevelToDeletionQueue(gameState.gameId);
            return true;
        }
        return false;
    }

    createNewGame(socketId: string, data: { levelId: number; playerName: string; waitingSecondPlayer?: boolean }): void {
        const playerGameState: GameState = {
            gameId: data.levelId,
            foundDifferences: [],
            playerName: data.playerName,
            waitingForSecondPlayer: data.waitingSecondPlayer,
        };
        if (!data.waitingSecondPlayer) {
            playerGameState.isInGame = true;
        }
        this.playerGameMap.set(socketId, playerGameState);
    }

    findAvailableGame(socketId: string, levelId: number): string {
        for (const [secondPlayerId, secondPlayerGameState] of this.playerGameMap.entries()) {
            if (secondPlayerId !== socketId && secondPlayerGameState.gameId === levelId) {
                if (secondPlayerGameState.waitingForSecondPlayer) {
                    return secondPlayerId;
                }
            }
        }
        return undefined;
    }

    changeMultiplayerGameState(socketId: string, secondPlayerId: string, playerName: string): void {
        const secondPlayerGameState: GameState = this.playerGameMap.get(secondPlayerId);
        secondPlayerGameState.secondPlayerId = socketId;
        this.playerGameMap.set(secondPlayerId, secondPlayerGameState);
        this.playerGameMap.set(socketId, {
            gameId: secondPlayerGameState.gameId,
            foundDifferences: [],
            playerName,
            secondPlayerId,
            waitingForSecondPlayer: true,
        });
    }

    connectRooms(socket: Socket, secondPlayerSocket: Socket): void {
        socket.join(secondPlayerSocket.id);
        secondPlayerSocket.join(socket.id);
        this.changeGameStatesForGame(socket.id, secondPlayerSocket.id);
    }

    getLevelDeletionQueue(): number[] {
        return this.levelDeletionQueue;
    }

    deleteUserFromGame(socket: Socket): void {
        if (this.playerGameMap.get(socket.id)) {
            const secondPlayerId = this.playerGameMap.get(socket.id).secondPlayerId;
            if (secondPlayerId) {
                socket.leave(secondPlayerId);
            }
            this.playerGameMap.delete(socket.id);
        }
    }

    getGameState(socketId: string): GameState {
        return this.playerGameMap.get(socketId);
    }

    getAndDeletePlayersWaitingForGame(gameId: number): string[] {
        const listOfPlayersToRemove: string[] = [];
        for (const [socketId, gameState] of this.playerGameMap.entries()) {
            if (gameState.waitingForSecondPlayer && gameState.gameId === gameId) {
                listOfPlayersToRemove.push(socketId);
                this.playerGameMap.delete(socketId);
            }
        }
        return listOfPlayersToRemove;
    }

    verifyIfLevelIsBeingPlayed(levelId: number): boolean {
        for (const gameState of this.playerGameMap.values()) {
            if (gameState.gameId === levelId && gameState.isInGame) {
                return true;
            }
        }
        this.imageService.deleteLevelData(levelId);
        return false;
    }

    addLevelToDeletionQueue(levelId: number): void {
        this.levelDeletionQueue.push(levelId);
    }

    removeLevelToDeletionQueue(levelId: number): void {
        const index = this.levelDeletionQueue.indexOf(levelId);
        if (index >= 0) {
            this.levelDeletionQueue.splice(index, 1);
            this.imageService.deleteLevelData(levelId);
        }
    }

    private changeGameStatesForGame(socketId: string, secondPlayerSocketId: string): void {
        const gameState = this.playerGameMap.get(socketId);
        gameState.isInGame = true;
        gameState.waitingForSecondPlayer = false;
        this.playerGameMap.set(socketId, gameState);

        const secondPlayerGameState = this.playerGameMap.get(secondPlayerSocketId);
        secondPlayerGameState.waitingForSecondPlayer = false;
        secondPlayerGameState.secondPlayerId = socketId;
        secondPlayerGameState.isInGame = true;
        this.playerGameMap.set(secondPlayerSocketId, secondPlayerGameState);
    }
}

import { ImageService } from '@app/services/image/image.service';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

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

    verifyWinCondition(socketId: string, totalDifferences: number): boolean {
        const gameState = this.playerGameMap.get(socketId);
        if (gameState.secondPlayerId && gameState.foundDifferences.length >= Math.ceil(totalDifferences / 2)) {
            this.deleteUserFromGame(socketId);
            this.deleteUserFromGame(gameState.secondPlayerId);
            return true;
        } else if (gameState.foundDifferences.length === totalDifferences) {
            this.deleteUserFromGame(socketId);
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
        secondPlayerGameState.waitingForSecondPlayer = false;
        this.playerGameMap.set(secondPlayerId, secondPlayerGameState);
        this.playerGameMap.set(socketId, {
            gameId: -1,
            foundDifferences: [],
            playerName,
            secondPlayerId,
            waitingForSecondPlayer: false,
        });
    }

    connectRooms(socket: Socket, secondPlayerSocket: Socket): void {
        socket.join(secondPlayerSocket.id);
        secondPlayerSocket.join(socket.id);
        this.changeSecondPlayerGameState(socket.id, secondPlayerSocket.id);
    }

    deleteUserFromGame(socketId: string): void {
        this.playerGameMap.delete(socketId);
    }

    getGameState(socketId: string): GameState {
        return this.playerGameMap.get(socketId);
    }

    private changeSecondPlayerGameState(socketId: string, secondPlayerSocketId: string): void {
        const secondPlayerGameState = this.playerGameMap.get(secondPlayerSocketId);
        secondPlayerGameState.waitingForSecondPlayer = false;
        secondPlayerGameState.secondPlayerId = socketId;
        secondPlayerGameState.gameId = this.playerGameMap.get(socketId).gameId;
        this.playerGameMap.set(secondPlayerSocketId, secondPlayerGameState);
    }
}

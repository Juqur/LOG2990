import { ImageService } from '@app/services/image/image.service';
import { GameData } from '@common/game-data';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface GameState {
    levelId: number;
    foundDifferences: number[];
    amountOfDifferencesFound: number;
    playerName: string;
    isInGame: boolean;
    isGameFound: boolean;
    otherSocketId?: string;
    isInCheatMode: boolean;
}

/**
 * This service is used to handle the game logic.
 *
 * @author Junaid Qureshi & Pierre Tran
 * @class GameService
 */
@Injectable()
export class GameService {
    private playerGameMap = new Map<string, GameState>();
    private levelDeletionQueue: number[] = [];

    constructor(private imageService: ImageService) {}

    /**
     * This method gets the level deletion queue.
     */
    getLevelDeletionQueue(): number[] {
        return this.levelDeletionQueue;
    }

    /**
     * This methods gets a game state from the playerGameMap.
     *
     * @param socketId The socket id of the player.
     */
    getGameState(socketId: string): GameState {
        return this.playerGameMap.get(socketId);
    }

    /**
     * This method gets a list of players currently waiting for a specific game.
     * It is used to remove players from the game when the game is deleted.
     *
     * @param levelId The id of the game.
     * @returns A list of socket ids of the players waiting for a game.
     */
    getPlayersWaitingForGame(levelId: number): string[] {
        const listOfPlayersToRemove: string[] = [];
        for (const [socketId, gameState] of this.playerGameMap.entries()) {
            if (gameState.levelId === levelId && !gameState.isInGame) {
                listOfPlayersToRemove.push(socketId);
            }
        }

        for (const socketId of listOfPlayersToRemove) {
            this.playerGameMap.delete(socketId);
        }
        return listOfPlayersToRemove;
    }

    /**
     * This method gets a list of levels currently joinable.
     *
     * @return The list of levels that are currently joinable.
     */
    getJoinableLevels(): number[] {
        const listOfLevels: number[] = [];
        for (const gameState of this.playerGameMap.values()) {
            if (!listOfLevels.includes(gameState.levelId) && !gameState.isGameFound) {
                listOfLevels.push(gameState.levelId);
            }
        }
        return listOfLevels;
    }

    /**
     * This method is called when a player clicks on a pixel.
     * It uses imageService to detect whether the pixel is a difference pixel.
     *
     * @param socketId The socket id of the player.
     * @param position The position of the pixel that was clicked.
     * @returns A GameState object containing the game data.
     */
    async getImageInfoOnClick(socketId: string, position: number): Promise<GameData> {
        const gameState = this.playerGameMap.get(socketId);
        const id: string = gameState.levelId as unknown as string;
        const response = await this.imageService.findDifference(id, gameState.foundDifferences, position);
        if (response.differencePixels && response.differencePixels.length > 0) {
            gameState.amountOfDifferencesFound++;
            this.playerGameMap.set(socketId, gameState);
            if (gameState.otherSocketId) {
                const otherGameState = this.playerGameMap.get(gameState.otherSocketId);
                otherGameState.foundDifferences = gameState.foundDifferences;
                this.playerGameMap.set(gameState.otherSocketId, otherGameState);
            }
        }
        return {
            differencePixels: response.differencePixels,
            totalDifferences: response.totalDifferences,
            amountOfDifferencesFound: gameState.amountOfDifferencesFound,
        };
    }

    /**
     * This method returns a boolean indicating whether the player has won.
     * It also deletes the player from the game if he has won in solo or in multiplayer.
     * It also deletes the level from the deletion queue if the level is not being played anymore.
     *
     * @param socketId The socket id of the player.
     * @param server The server object.
     * @param totalDifferences The total amount of differences in the level.
     * @returns A boolean indicating whether the player has won.
     */
    verifyWinCondition(socket: Socket, server: Server, totalDifferences: number): boolean {
        const gameState = this.playerGameMap.get(socket.id);
        if (gameState.otherSocketId && gameState.amountOfDifferencesFound >= Math.ceil(totalDifferences / 2)) {
            this.deleteUserFromGame(socket);
            this.deleteUserFromGame(server.sockets.sockets.get(gameState.otherSocketId));
            if (!this.verifyIfLevelIsBeingPlayed(gameState.levelId)) this.removeLevelFromDeletionQueue(gameState.levelId);
            return true;
        } else if (gameState.amountOfDifferencesFound === totalDifferences) {
            this.deleteUserFromGame(socket);
            if (!this.verifyIfLevelIsBeingPlayed(gameState.levelId)) this.removeLevelFromDeletionQueue(gameState.levelId);
            return true;
        }
        return false;
    }

    /**
     * This method creates a new game state for the player.
     * It creates a new entry in the playerGameMap.
     * If the game is solo, it is implied that the game is already found and the player is in the game.
     * If the game is multiplayer, it has to match make therefore the game is not found and the player is not in the game.
     *
     * @param socketId The socket id of the player.
     * @param data The data containing the level id, the player name.
     * @param isMultiplayer A boolean flag indicating whether the game is multiplayer.
     */
    createGameState(socketId: string, data: { levelId: number; playerName: string }, isMultiplayer: boolean): void {
        const playerGameState: GameState = {
            levelId: data.levelId,
            foundDifferences: [],
            amountOfDifferencesFound: 0,
            playerName: data.playerName,
            isInGame: !isMultiplayer,
            isGameFound: !isMultiplayer,
            isInCheatMode: false,
        };
        this.playerGameMap.set(socketId, playerGameState);
    }

    /**
     * This method is called when a player tries to create a game.
     * It searches for a game that is waiting for a second player and has the same level.
     *
     * @param socketId The socket id of the player.
     * @param levelId The level id of the level that the player wants to play.
     * @returns the id of the second player if he is found, undefined otherwise.
     */
    findAvailableGame(socketId: string, levelId: number): string {
        for (const [otherSocketId, otherGameState] of this.playerGameMap.entries()) {
            if (otherGameState.levelId === levelId && otherSocketId !== socketId && !otherGameState.isGameFound) {
                return otherSocketId;
            }
        }
        return undefined;
    }

    /**
     * This method connects the rooms of the two players.
     * It also sets the isInGame property to true.
     *
     * @param socketId The socket id of the player.
     * @param secondPlayerId The socket id of the second player.
     */
    connectRooms(socket: Socket, otherSocket: Socket): void {
        this.playerGameMap.get(socket.id).isInGame = true;
        this.playerGameMap.get(otherSocket.id).isInGame = true;
        this.bindPlayers(socket.id, otherSocket.id);
    }

    /**
     * This method removes the player from the game.
     * It also removes the player from the room of the second player.
     *
     * @param socket The socket of the player.
     */
    deleteUserFromGame(socket: Socket): void {
        if (this.playerGameMap.get(socket.id)) {
            const otherSocketId = this.playerGameMap.get(socket.id).otherSocketId;
            if (otherSocketId) {
                socket.leave(otherSocketId);
            }
            this.playerGameMap.delete(socket.id);
        }
    }

    /**
     * This method verifies if there are players currently playing the level.
     * If there are no players playing the level, it deletes the level from the server.
     *
     * @param levelId The id of the level.
     * @returns A boolean indicating whether the level is being played.
     */
    verifyIfLevelIsBeingPlayed(levelId: number): boolean {
        for (const gameState of this.playerGameMap.values()) {
            if (gameState.levelId === levelId && gameState.isInGame) {
                return true;
            }
        }
        return false;
    }

    /**
     * This method adds the level id to the levelDeletionQueue.
     *
     * @param levelId The id of the level.
     */
    addLevelToDeletionQueue(levelId: number): void {
        this.levelDeletionQueue.push(levelId);
    }

    /**
     * This method removes the level id from the levelDeletionQueue if it is found in it.
     * It also deletes the level from the server.
     *
     * @param levelId The id of the level.
     */
    removeLevelFromDeletionQueue(levelId: number): void {
        const index = this.levelDeletionQueue.indexOf(levelId);
        if (index >= 0) {
            this.levelDeletionQueue.splice(index, 1);
            this.imageService.deleteLevelData(levelId);
        }
    }

    /**
     * This method starts the cheat mode and returns an array containing the coordinates of all the pixels
     * which are part of differences. It does so by changing the isInCheatMode attribute of the game state
     * to true.
     *
     * @param socketId the id of the associated socket
     * @returns an array containing all the differences of the level.
     */
    async startCheatMode(socketId: string): Promise<number[]> {
        const gameState = this.getGameState(socketId);
        gameState.isInCheatMode = true;
        const differencesGroups = await this.imageService.getAllDifferences(gameState.levelId.toString());
        let differences: number[] = [];
        differencesGroups.forEach((element) => {
            differences = differences.concat(element);
        });
        this.playerGameMap.set(socketId, gameState);
        return differences;
    }

    /**
     * This method stops the cheat mode on a given socket by changing the isInCheatMode attribute of the game state to false.
     *
     * @param socketId the id off the associated socket.
     */
    stopCheatMode(socketId: string): void {
        const gameState = this.getGameState(socketId);
        gameState.isInCheatMode = false;
        this.playerGameMap.set(socketId, gameState);
    }

    /**
     * This method deletes the level from the server.
     *
     * @param levelId The id of the level.
     */
    deleteLevel(levelId: number): void {
        this.imageService.deleteLevelData(levelId);
    }

    /**
     * Binds the two players together by their socket ids.
     * It is used to match make the players, but unofficially since it needs confirmation.
     *
     * @param socketId The socket id of the player.
     * @param otherSocketId The socket id of the other player.
     */
    bindPlayers(socketId: string, otherSocketId: string): void {
        const gameState = this.playerGameMap.get(socketId);
        gameState.isGameFound = true;
        gameState.otherSocketId = otherSocketId;
        this.playerGameMap.set(socketId, gameState);

        const otherGameState = this.playerGameMap.get(otherSocketId);
        otherGameState.isGameFound = true;
        otherGameState.otherSocketId = socketId;
        this.playerGameMap.set(otherSocketId, otherGameState);
    }
}

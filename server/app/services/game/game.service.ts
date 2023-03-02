import { Injectable } from '@nestjs/common';

@Injectable()
export class GameStateService {
    private gameStates = new Map<string, GameState>();
    private playerRoomMap = new Map<string, number>();

    createGameState(gameId: string, gameState: GameState): void {
        this.gameStates.set(gameId, gameState);
    }

    getGameState(gameId: string): GameState {
        return this.gameStates.get(gameId);
    }

    deleteGameState(gameId: string) {
        this.gameStates.delete(gameId);
    }
}

export interface GameState {
    gameId: string;
    foundDifferences: number[];
    playerName: string;
    secondPlayerId: string;
}

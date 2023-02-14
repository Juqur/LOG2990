import { Injectable } from '@nestjs/common';

@Injectable()
export class GameStateService {
    private gameStates = new Map<string, GameState>();

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
    imageId: string;
    foundDifferences: number[];
}

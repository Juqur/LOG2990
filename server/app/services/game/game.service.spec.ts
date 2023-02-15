import { Test, TestingModule } from '@nestjs/testing';
import { GameState, GameStateService } from './game.service';

describe('GameStateService', () => {
    let service: GameStateService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameStateService],
        }).compile();

        service = module.get<GameStateService>(GameStateService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createGameState should add a game to the map', () => {
        const gameSate: GameState = { imageId: '1', foundDifferences: [] };
        service.createGameState('1', gameSate);
        expect(service['gameStates'].get('1')).toEqual(gameSate);
    });

    it('getGameState should return the game state', () => {
        const gameSate: GameState = { imageId: '1', foundDifferences: [] };
        service['gameStates'].set('1', gameSate);
        const result = service.getGameState('1');
        expect(result).toEqual(gameSate);
    });

    it('deleteGameState should delete a game', () => {
        const gameSate: GameState = { imageId: '1', foundDifferences: [] };
        service['gameStates'].set('1', gameSate);
        service.deleteGameState('1');
        expect(service['gameStates'].get('1')).toBeUndefined();
    });
});

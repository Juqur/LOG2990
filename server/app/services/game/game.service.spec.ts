import { ImageService } from '@app/services/image/image.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let imageService: SinonStubbedInstance<ImageService>;

    beforeEach(async () => {
        imageService = createStubInstance(ImageService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [GameService, { provide: ImageService, useValue: imageService }],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // describe('getLevelDeletionQueue', () => {
    //     it('should return the correct data', () => {
    //         const expectedQueue = [1, 2, 3];
    //         service['levelDeletionQueue'] = expectedQueue;
    //         expect(service.getLevelDeletionQueue()).toEqual(expectedQueue);
    //     });
    // });

    // describe('getGameState', () => {
    //     it('should return the correct data', () => {
    //         const expectedGameState = {
    //             gameId: 0,
    //             foundDifferences: [1],
    //             playerName: 'player',
    //             isInGame: false,
    //         };
    //         service['playerGameMap'].set('socket', expectedGameState);
    //         expect(service.getGameState('socket')).toEqual(expectedGameState);
    //     });
    // });

    // describe('getPlayersWaitingForGame', () => {
    //     it('should select the correct players from a selected game', () => {
    //         service['playerGameMap'] = TestConstants.PLAYER_GAME_MAP;
    //         const result = service.getPlayersWaitingForGame(1);
    //         expect(result).toEqual(['socket3', 'socket4']);
    //         expect(service['playerGameMap']).not.toContain('socket3');
    //         expect(service['playerGameMap']).not.toContain('socket4');
    //     });

    //     it('should return an empty array if there is no players from a selected game.', () => {
    //         const result = service.getPlayersWaitingForGame(0);
    //         expect(result).toEqual([]);
    //     });
    // });

    // describe('getImageInfoOnClick', () => {
    //     it('should return the correct data', async () => {
    //         service['playerGameMap'].set('socket', {
    //             gameId: 0,
    //             foundDifferences: [1],
    //             playerName: 'player',
    //             isInGame: false,
    //         });
    //         spyOn(service['imageService'], 'findDifference').and.returnValue({
    //             differencePixels: TestConstants.CLUSTERS_TEST1[0],
    //             totalDifferences: TestConstants.CLUSTERS_TEST1.length,
    //         });

    //         const result = await service.getImageInfoOnClick('socket', 1);
    //         expect(result).toEqual({
    //             differencePixels: TestConstants.CLUSTERS_TEST1[0],
    //             totalDifferences: TestConstants.CLUSTERS_TEST1.length,
    //             amountOfDifferencesFound: 1,
    //         });
    //     });
    // });

    // describe('createNewGame', () => {
    //     it('should successfully create a new game for single player', () => {
    //         service.createNewGame('socket', { levelId: 1, playerName: 'player' });
    //         expect(service['playerGameMap'].get('socket')).toEqual({
    //             gameId: 0,
    //             foundDifferences: [],
    //             playerName: 'player',
    //             isInGame: true,
    //         });
    //     });

    //     it('should successfully create a new game for multiplayer', () => {
    //         service.createNewGame('socket', { levelId: 1, playerName: 'player', waitingSecondPlayer: true });
    //         expect(service['playerGameMap'].get('socket')).toEqual({
    //             gameId: 0,
    //             foundDifferences: [],
    //             playerName: 'player',
    //             isInGame: true,
    //             waitingForSecondPlayer: true,
    //         });
    //     });
    // });
    // describe('setInGame', () => {
    //     it('should set isInGame to true', () => {
    //         service['playerGameMap'] = new Map<string, GameState>([
    //             ['socket1', { gameId: 0, foundDifferences: [1], playerName: 'player1', isInGame: false, otherSocketId: 'socket2' }],
    //             ['socket2', { gameId: 0, foundDifferences: [1], playerName: 'player2', isInGame: false, otherSocketId: 'socket1' }],
    //         ]);
    //         service['setInGame']('socket1', 'socket2');
    //     });
    // });
});

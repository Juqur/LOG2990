import { ImageService } from '@app/services/image/image.service';
import { TestConstants } from '@common/test-constants';
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

    describe('getLevelDeletionQueue', () => {
        it('should return the correct data', () => {
            const expectedQueue = [1, 2, 3];
            service['levelDeletionQueue'] = expectedQueue;
            expect(service.getLevelDeletionQueue()).toEqual(expectedQueue);
        });
    });

    describe('getGameState', () => {
        it('should return the correct data', () => {
            const expectedGameState = {
                gameId: 0,
                foundDifferences: [1],
                playerName: 'player',
            };
            service['playerGameMap'].set('socket', expectedGameState);
            expect(service.getGameState('socket')).toEqual(expectedGameState);
        });
    });

    describe('getImageInfoOnClick', () => {
        it('should return the correct data', async () => {
            service['playerGameMap'].set('socket', {
                gameId: 0,
                foundDifferences: [1],
                playerName: 'player',
            });
            spyOn(service['imageService'], 'findDifference').and.returnValue({
                differencePixels: TestConstants.CLUSTERS_TEST1[0],
                totalDifferences: TestConstants.CLUSTERS_TEST1.length,
            });

            const result = await service.getImageInfoOnClick('socket', 1);
            expect(result).toEqual({
                differencePixels: TestConstants.CLUSTERS_TEST1[0],
                totalDifferences: TestConstants.CLUSTERS_TEST1.length,
                amountOfDifferencesFound: 1,
            });
        });
    });
});

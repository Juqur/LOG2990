import { GameStateService } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';

describe('GameController', () => {
    let controller: GameController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [GameStateService, ImageService, Logger],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('createNewGame should call createGameState', () => {
        jest.spyOn(controller, 'generateGameId');
        const spy = jest.spyOn(controller['gameStateService'], 'createGameState');
        controller.createNewGame({ imageId: '1' });
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('createNewGame should return a game id', () => {
        jest.spyOn(controller, 'generateGameId').mockReturnValue('1');
        jest.spyOn(controller['gameStateService'], 'createGameState');
        const result = controller.createNewGame({ imageId: '1' });
        expect(JSON.parse(result)).toEqual('1');
    });

    it('generate id should return an id of length 12', () => {
        const result = controller.generateGameId();
        expect(result.length).toBeGreaterThan(0);
    });

    it('findImageDifference should call getGameState', async () => {
        const spy = jest.spyOn(controller['gameStateService'], 'getGameState');
        jest.spyOn(controller['imageService'], 'findDifference');
        controller['gameStateService']['gameStates'].set('1', { imageId: '1', foundDifferences: [] });
        await controller.findImageDifference({ gameId: '1', position: 1 });
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('findImageDifference should return the array of differences found', async () => {
        jest.spyOn(controller['gameStateService'], 'getGameState');
        jest.spyOn(controller['imageService'], 'findDifference').mockReturnValue(Promise.resolve([1]));
        controller['gameStateService']['gameStates'].set('1', { imageId: '1', foundDifferences: [] });
        let result: number[];
        await controller.findImageDifference({ gameId: '1', position: 1 }).then((value) => {
            result = value;
        });
        expect(result).toEqual([1]);
    });
});

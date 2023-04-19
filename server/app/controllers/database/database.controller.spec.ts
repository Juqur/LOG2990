import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { Constants } from '@common/constants';
import { GameConstants } from '@common/game-constants';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { DatabaseController } from './database.controller';

describe('DatabaseController', () => {
    let controller: DatabaseController;
    let mongodbService: SinonStubbedInstance<MongodbService>;
    let gameConstants: GameConstants;

    beforeEach(async () => {
        gameConstants = {
            initialTime: Constants.INIT_COUNTDOWN_TIME,
            timePenaltyHint: Constants.HINT_PENALTY,
            timeGainedDifference: Constants.COUNTDOWN_TIME_WIN,
        } as GameConstants;
        mongodbService = createStubInstance<MongodbService>(MongodbService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DatabaseController],
            providers: [{ provide: MongodbService, useValue: mongodbService }],
        }).compile();

        controller = module.get<DatabaseController>(DatabaseController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call mongodb service getGameConstants', async () => {
        const spy = jest.spyOn(mongodbService, 'getGameConstants');
        spy.mockResolvedValue(gameConstants);
        const result = await controller.getGameConstants();
        expect(result).toEqual(gameConstants);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call mongodb service setNewGameConstants', async () => {
        const spy = jest.spyOn(mongodbService, 'setNewGameConstants');
        await controller.setNewGameConstants(gameConstants);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call mongodb service resetGameConstants', async () => {
        const spy = jest.spyOn(mongodbService, 'resetGameConstants');
        await controller.resetGameConstants();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call mongodb service getGameHistories', async () => {
        const spy = jest.spyOn(mongodbService, 'getGameHistories');
        await controller.getGameHistories();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call mongodb service deleteAllGameHistories', async () => {
        const spy = jest.spyOn(mongodbService, 'deleteAllGameHistories');
        await controller.deleteGameHistories();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});

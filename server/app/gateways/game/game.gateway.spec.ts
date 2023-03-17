import { GameData, GameService, GameState } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Namespace, Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let socket: SinonStubbedInstance<Socket>;
    let socketSecondPlayer: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameService: SinonStubbedInstance<GameService>;
    let timerService: SinonStubbedInstance<TimerService>;
    let gameState: GameState;

    const gameData: GameData = {
        differencePixels: [],
        totalDifferences: 0,
        amountOfDifferencesFound: 0,
    };

    beforeEach(async () => {
        gameState = {
            gameId: 1,
            foundDifferences: [],
            playerName: 'Alice',
        };
        timerService = createStubInstance<TimerService>(TimerService);
        gameService = createStubInstance<GameService>(GameService);
        socket = createStubInstance<Socket>(Socket);
        socketSecondPlayer = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                ImageService,
                { provide: GameService, useValue: gameService },
                { provide: TimerService, useValue: timerService },
                { provide: Socket, useValue: socket },
                { provide: Server, useValue: server },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        const socketNameSpace = {} as Namespace;
        const socketMaps = new Map<string, Socket>();
        socketMaps.set('1', socketSecondPlayer);
        Object.defineProperty(server, 'sockets', { value: socketNameSpace });
        Object.defineProperty(socketNameSpace, 'sockets', { value: socketMaps });
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should call timer service and game service when player joins a solo game', () => {
        const timerSpy = jest.spyOn(timerService, 'startTimer');
        const gameSpy = jest.spyOn(gameService, 'createNewGame');
        const data = { levelId: 1, playerName: 'test' };
        gateway.onJoinSoloClassicGame(socket, data);
        expect(gameSpy).toHaveBeenCalled();
        expect(timerSpy).toHaveBeenCalled();
    });

    it('should emit back to socket when player clicks', async () => {
        jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
        jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(false);
        jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
        const emitSpy = jest.spyOn(socket, 'emit');
        await gateway.onClick(socket, 1);
        expect(emitSpy).toBeCalledWith('onProcessedClick', gameData);
    });

    it('should emit to the opponent when player clicks', async () => {
        gameState.secondPlayerId = '1';
        jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
        jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(false);
        jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
        const emitSpy = jest.spyOn(socket, 'emit');
        const emitSecondPlayerSpy = jest.spyOn(socketSecondPlayer, 'emit');
        await gateway.onClick(socket, 1);
        expect(emitSpy).toBeCalledWith('onProcessedClick', gameData);
        expect(emitSecondPlayerSpy).toBeCalledWith('onProcessedClick', gameData);
    });

    it('should emit a victory event if player wins', async () => {
        jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
        jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(true);
        jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);

        const timerSpy = jest.spyOn(timerService, 'stopTimer');
        const gameSpy = jest.spyOn(gameService, 'deleteUserFromGame');
        const emitSpy = jest.spyOn(socket, 'emit');

        await gateway.onClick(socket, 1);

        expect(emitSpy).toBeCalledWith('onProcessedClick', gameData);
        expect(emitSpy).toBeCalledWith('onVictory');
        expect(timerSpy).toBeCalled();
        expect(gameSpy).toBeCalled();
    });

    it('should emit a defeat to the opponent event if player wins', async () => {
        gameState.secondPlayerId = '1';
        jest.spyOn(gameService, 'getImageInfoOnClick').mockReturnValue(Promise.resolve(gameData));
        jest.spyOn(gameService, 'verifyWinCondition').mockReturnValue(true);
        jest.spyOn(gameService, 'getGameState').mockReturnValue(gameState);
        jest.spyOn(timerService, 'stopTimer');
        jest.spyOn(gameService, 'deleteUserFromGame');
        const emitSecondPlayerSpy = jest.spyOn(socketSecondPlayer, 'emit');

        await gateway.onClick(socket, 1);

        expect(emitSecondPlayerSpy).toBeCalledWith('onProcessedClick', gameData);
        expect(emitSecondPlayerSpy).toBeCalledWith('onDefeat');
    });
});

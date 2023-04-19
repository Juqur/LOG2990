import { GameEvents } from '@app/gateways/game/game.gateway.events';
import { ChatService } from '@app/services/chat/chat.service';
import { GameState } from '@app/services/game/game.service';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { ChatMessage } from '@common/interfaces/chat-messages';
import { GameData } from '@common/interfaces/game-data';
import { Level } from '@common/interfaces/level';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';

describe('ChatService', () => {
    let gameState = {} as unknown as GameState;
    let service: ChatService;
    let mongodbService: SinonStubbedInstance<MongodbService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let emitSpy: jest.SpyInstance;
    let emitToSpy: jest.SpyInstance;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        mongodbService = createStubInstance<MongodbService>(MongodbService);
        emitSpy = jest.spyOn(socket, 'emit').mockImplementation();
        emitToSpy = jest.spyOn(socket, 'to').mockImplementation(() => ({ emit: jest.fn() } as never));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: MongodbService,
                    useValue: mongodbService,
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendSystemGlobalHighscoreMessage', () => {
        const gameName = 'NOM_JEU';
        const level: Level = {
            name: gameName,
        } as unknown as Level;
        let serverEmitSpy: jest.SpyInstance;

        beforeEach(() => {
            serverEmitSpy = jest.spyOn(server, 'emit');
            jest.spyOn(mongodbService, 'getLevelById' as never).mockResolvedValue(level as never);
            jest.spyOn(service, 'getSystemChatMessage' as never).mockImplementation();
        });

        afterEach(() => {
            gameState = {} as unknown as GameState;
        });

        it('should send a system message with 1ère position when the winner is in first place in SOLO', async () => {
            const playerName = 'Alice';
            const playerPosition = 1;
            gameState = {
                playerName,
                otherSocketId: undefined,
            } as unknown as GameState;

            await service.sendSystemGlobalHighscoreMessage(server, gameState, playerPosition);
            expect(serverEmitSpy).toHaveBeenCalledWith(
                GameEvents.MessageSent,
                service['getSystemChatMessage']('Alice obtient la 1ère place dans les meilleurs temps du jeu "NOM_JEU" en SOLO'),
            );
        });

        it('should send a system message with 1ère position when the winner is in first place in 1v1', async () => {
            const playerName = 'Alice';
            const playerPosition = 1;
            gameState = {
                playerName,
                gameName,
                otherSocketId: 'aRandomSocketId',
            } as unknown as GameState;

            await service.sendSystemGlobalHighscoreMessage(server, gameState, playerPosition);
            expect(serverEmitSpy).toHaveBeenCalledWith(
                GameEvents.MessageSent,
                service['getSystemChatMessage']('Alice obtient la 1ère place dans les meilleurs temps du jeu "NOM_JEU" en 1v1'),
            );
        });

        it('should send a system message with 3e/2e position when the winner is in not in first place', async () => {
            const playerName = 'Alice';
            const playerPosition = 3;
            gameState = {
                playerName,
                gameName,
                otherSocketId: undefined,
            } as unknown as GameState;

            await service.sendSystemGlobalHighscoreMessage(server, gameState, playerPosition);

            expect(serverEmitSpy).toHaveBeenCalledWith(
                GameEvents.MessageSent,
                service['getSystemChatMessage']('Alice obtient la 3e place dans les meilleurs temps du jeu "NOM_JEU" en SOLO'),
            );
        });

        it('should send a system message with the number of players', async () => {
            const playerName = 'Alice';
            const playerPosition = 3;
            gameState = {
                playerName,
                gameName,
                otherSocketId: 'AnotherRandomSocketId',
            } as unknown as GameState;

            await service.sendSystemGlobalHighscoreMessage(server, gameState, playerPosition);

            expect(serverEmitSpy).toHaveBeenCalledWith(
                GameEvents.MessageSent,
                service['getSystemChatMessage']('Alice obtient la 3e place dans les meilleurs temps du jeu "NOM_JEU" en 1v1'),
            );
        });
    });

    describe('sendSystemMessage', () => {
        let data: GameData;
        let getSystemChatMessageSpy: jest.SpyInstance;

        beforeEach(() => {
            data = {
                differencePixels: [0, 1],
            } as unknown as GameData;
            getSystemChatMessageSpy = jest.spyOn(service, 'getSystemChatMessage' as never).mockImplementation();
        });

        it('should call emit', () => {
            service.sendSystemMessage(socket, data, gameState);
            expect(emitSpy).toHaveBeenCalledTimes(1);
        });

        it('should call getSystemChatMessage if a difference is found', () => {
            service.sendSystemMessage(socket, data, gameState);
            expect(getSystemChatMessageSpy).toHaveBeenCalledWith('Différence trouvée');
        });

        it('should call getSystemChatMessage if a difference is not found', () => {
            data.differencePixels = [];
            service.sendSystemMessage(socket, data, gameState);
            expect(getSystemChatMessageSpy).toHaveBeenCalledWith('Erreur');
        });

        it('should call emit to the other socket if the other socket exists', () => {
            gameState.otherSocketId = 'otherSocketId';
            service.sendSystemMessage(socket, data, gameState);
            expect(emitToSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('sendToBothPlayers', () => {
        const message = {} as unknown as ChatMessage;

        it('should call emit', () => {
            service.sendToBothPlayers(socket, message, gameState);
            expect(emitSpy).toHaveBeenCalledTimes(1);
        });

        it('should call emit to the other socket', () => {
            service.sendToBothPlayers(socket, message, gameState);
            expect(emitToSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('abandonMessage', () => {
        let getSystemChatMessageSpy: jest.SpyInstance;

        beforeEach(() => {
            getSystemChatMessageSpy = jest.spyOn(service, 'getSystemChatMessage' as never).mockImplementation();
        });

        it('should call emit to the other socket', () => {
            service.abandonMessage(socket, gameState);
            expect(emitToSpy).toHaveBeenCalledTimes(1);
        });

        it('should call getSystemChatMessage', () => {
            service.abandonMessage(socket, gameState);
            expect(getSystemChatMessageSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('sendMessageToPlayer', () => {
        const message = 'This is a message';

        it('should call emit', () => {
            service.sendMessageToPlayer(socket, message);
            expect(emitSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('getSystemChatMessage', () => {
        it('should send the correct message form', () => {
            const expectedMessage = 'This should be the message';
            const result = service['getSystemChatMessage'](expectedMessage);
            expect(result).toStrictEqual({
                sender: 'Système',
                senderId: 'system',
                text: expectedMessage,
            });
        });
    });
});

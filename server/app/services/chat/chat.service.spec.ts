import { GameState } from '@app/services/game/game.service';
import { ChatMessage } from '@common/interfaces/chat-messages';
import { GameData } from '@common/interfaces/game-data';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    const gameState = {} as unknown as GameState;
    let service: ChatService;
    let socket: SinonStubbedInstance<Socket>;
    let emitSpy: jest.SpyInstance;
    let emitToSpy: jest.SpyInstance;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        emitSpy = jest.spyOn(socket, 'emit');
        emitToSpy = jest.spyOn(socket, 'to').mockImplementation(() => ({ emit: jest.fn() } as never));

        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatService],
        }).compile();

        service = module.get<ChatService>(ChatService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
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

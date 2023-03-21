import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let socket: SinonStubbedInstance<Socket>;
    // let emitSpy: jest.SpyInstance;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        // emitSpy = jest.spyOn(socket, 'to').mockImplementation(() => ({ emit: jest.fn() } as never));

        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatService],
        }).compile();

        service = module.get<ChatService>(ChatService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendSystemMessage', () => {
        it('should call getGameState', () => {
            // TODO
        });
    });
});

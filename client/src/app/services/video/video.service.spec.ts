import { TestBed } from '@angular/core/testing';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { ChatMessage } from '@common/interfaces/chat-messages';

import { VideoService } from './video.service';

describe('VideoService', () => {
    let service: VideoService;
    let popUpServiceSpy: jasmine.SpyObj<PopUpService>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [VideoService, { provide: PopUpService, useValue: popUpServiceSpy }],
        });
        service = TestBed.inject(VideoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('popStack should pop from VideoService.videoStack if not empty', () => {
        spyOn(VideoService, 'isStackEmpty').and.returnValue(false);
        const popSpy = spyOn(VideoService['videoStack'], 'pop');
        VideoService.popStack();
        expect(popSpy).toHaveBeenCalledTimes(1);
    });

    it('popStack should not pop from VideoService.videoStack if empty', () => {
        spyOn(VideoService, 'isStackEmpty').and.returnValue(true);
        const popSpy = spyOn(VideoService['videoStack'], 'pop');
        VideoService.popStack();
        expect(popSpy).toHaveBeenCalledTimes(0);
    });

    it('isStackEmpty should return true if VideoService.videoStack is empty', () => {
        VideoService['videoStack'] = [];
        expect(VideoService.isStackEmpty()).toBeTrue();
    });

    it('addToVideoStack should add to VideoService.videoStack', () => {
        const pushSpy = spyOn(VideoService['videoStack'], 'push');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        VideoService.addToVideoStack(0, undefined, 0, 0, context, context);
        expect(pushSpy).toHaveBeenCalledTimes(1);
    });

    it('getFirstPlayerName should return the first player name', () => {
        VideoService.firstPlayerName = 'player1';
        VideoService.getFirstPlayerName();
        expect(VideoService.getFirstPlayerName()).toEqual('player1');
    });

    it('getSecondPlayerName should return the second player name', () => {
        VideoService.secondPlayerName = 'player2';
        VideoService.getSecondPlayerName();
        expect(VideoService.getSecondPlayerName()).toEqual('player2');
    });

    it('getMessagesStackElement should return the element of the message stack', () => {
        const chatMessage1: ChatMessage = { sender: 'player1', senderId: 'player1', text: 'message1' };
        const chatMessage2: ChatMessage = { sender: 'player2', senderId: 'player2', text: 'message2' };
        const time = 0;
        VideoService.messageStack = [
            { chatMessage: chatMessage1, time },
            { chatMessage: chatMessage2, time },
        ];
        VideoService.getMessagesStackElement(1);
        expect(VideoService.getMessagesStackElement(1)).toEqual({ chatMessage: chatMessage2, time });
    });
});

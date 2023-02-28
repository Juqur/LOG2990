import { TestBed } from '@angular/core/testing';

import { AudioService } from './audio.service';

describe('AudioService', () => {
    let service: AudioService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AudioService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('create should create an audio HTML element', () => {
        const audio = service.create('./assets/audio/click.mp3');
        expect(audio).toBeInstanceOf(HTMLAudioElement);
    });

    it('play should play the audio and the autoplay is allowed', () => {
        const audio = service.create('./assets/audio/click.mp3');
        const spyAudioPlay = spyOn(audio, 'play').and.returnValue(Promise.resolve());
        service.play(audio);
        expect(spyAudioPlay).toHaveBeenCalled();
    });

    it('play should not play the audio if it is undefined and the autoplay is denied', () => {
        const audio = service.create('');
        const spyAudioPlay = spyOn(audio, 'play').and.returnValue(
            Promise.reject().catch(() => {
                /* Do nothing */
            }),
        );
        service.play(undefined);
        expect(spyAudioPlay).not.toHaveBeenCalled();
    });

    it('playSound should call create and play', () => {
        const spyCreate = spyOn(service, 'create');
        const spyPlay = spyOn(service, 'play');
        service.playSound('./assets/audio/click.mp3');
        expect(spyCreate).toHaveBeenCalled();
        expect(spyPlay).toHaveBeenCalled();
    });

    it('mute should mute a specific audio HTML element', () => {
        const audio = service.create('./assets/audio/soundtrack.mp3');
        service.play(audio);
        service.mute(audio);
        expect(audio.muted).toBeTruthy();
    });

    it('mute should mute the soundtrack', () => {
        service.soundtrack = service.create('./assets/audio/soundtrack.mp3');
        service.play(service.soundtrack);
        service.mute();
        expect(service.soundtrack.muted).toBeTruthy();
    });
});

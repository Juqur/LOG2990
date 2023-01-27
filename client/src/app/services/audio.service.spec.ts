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
    it('should create an audio HTML element', () => {
        const audio = service.create('./assets/audio/click.mp3');
        expect(audio).toBeInstanceOf(HTMLAudioElement);
    });
    it('should play an audio HTML element', () => {
        const audio = service.create('./assets/audio/click.mp3');
        const spyAudioPlay = spyOn(audio, 'play');
        service.play(audio);
        expect(spyAudioPlay).toHaveBeenCalled();
    });
    it('playSound should call create and play', () => {
        const spyCreate = spyOn(service, 'create');
        const spyPlay = spyOn(service, 'play');
        service.playSound('./assets/audio/click.mp3');
        expect(spyCreate).toHaveBeenCalled();
        expect(spyPlay).toHaveBeenCalled();
    });
    it('should mute an audio HTML element', () => {
        const audio = service.create('./assets/audio/click.mp3');
        service.play(audio);
        service.mute(audio);
        expect(audio.muted).toBeTruthy();
    });
});

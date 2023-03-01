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

    it('Create should create a new HTMLAudioElement', () => {
        service.create('./assets/audio/click.mp3');
        expect(service['soundtrack']).toBeInstanceOf(HTMLAudioElement);
        expect(service['soundtrack']).toBeTruthy();
    });

    it('play should play the audio if the audioElement is defined', () => {
        service['soundtrack'] = new Audio('./assets/audio/click.mp3');
        service['soundtrack'].load();
        const spyAudioPlay = spyOn(Audio.prototype, 'play').and.returnValue(Promise.resolve());
        service.play();
        expect(spyAudioPlay).toHaveBeenCalledTimes(1);
    });

    it('play should not play the audio if it has not been initialized.', () => {
        const spyAudioPlay = spyOn(Audio.prototype, 'play').and.returnValue(Promise.resolve());
        service.play();
        expect(spyAudioPlay).not.toHaveBeenCalled();
    });

    it('Mute should mute the AudioElement', () => {
        service['soundtrack'] = new Audio('');
        service['soundtrack'].load();
        service.mute();
        expect(service['soundtrack'].muted).toBeTrue();
    });

    it('Loop should loop the current AudioElement', () => {
        service['soundtrack'] = new Audio('');
        service['soundtrack'].load();
        service.loop();
        expect(service['soundtrack'].loop).toBeTrue();
    });

    it('Reset should call audio.load', () => {
        service['soundtrack'] = new Audio('');
        service['soundtrack'].load();
        const spy = spyOn(Audio.prototype, 'load');
        service.reset();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('quickPlay should call play', () => {
        const spyPlay = spyOn(Audio.prototype, 'play');
        AudioService.quickPlay('./assets/audio/click.mp3');
        expect(spyPlay).toHaveBeenCalledTimes(1);
    });
});

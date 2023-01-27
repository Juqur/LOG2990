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
        expect(service.playSound('./assets/audio/click.mp3'));
    });
});

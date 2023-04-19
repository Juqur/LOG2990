import { TestBed } from '@angular/core/testing';
import { PopUpService } from '@app/services/pop-up/pop-up.service';

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
});

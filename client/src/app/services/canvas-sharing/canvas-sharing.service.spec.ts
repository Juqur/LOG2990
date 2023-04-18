import { TestBed } from '@angular/core/testing';

import { CanvasSharingService } from './canvas-sharing.service';

describe('CanvasSharingService', () => {
    let service: CanvasSharingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasSharingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set defaultCanvasRef', () => {
        const canvas = {} as HTMLCanvasElement;
        service.defaultCanvas = canvas;
        expect(service.defaultCanvas).toBe(canvas);
    });

    it('should set differenceCanvasRef', () => {
        const canvas = {} as HTMLCanvasElement;
        service.differenceCanvas = canvas;
        expect(service.differenceCanvas).toBe(canvas);
    });
});

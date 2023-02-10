import { TestBed } from '@angular/core/testing';

import { CanvasSharingService } from './canvas-sharing.service';

describe('CanvasSharingService', () => {
    let service: CanvasSharingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasSharingService);
    });

    it('should set defaultCanvasRef', () => {
        const canvas = {} as HTMLCanvasElement;
        service.setDefaultCanvasRef(canvas);
        expect(service.defaultCanvasRef).toBe(canvas);
    });

    it('should set diffCanvasRef', () => {
        const canvas = {} as HTMLCanvasElement;
        service.setDiffCanvasRef(canvas);
        expect(service.diffCanvasRef).toBe(canvas);
    });
});
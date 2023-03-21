import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { MouseService } from '@app/services/mouse.service';

describe('MouseService', () => {
    let service: MouseService;
    let mouseEvent: MouseEvent;
    // const mockGameId = '10000';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, AppMaterialModule, RouterTestingModule],
        });
        service = TestBed.inject(MouseService);
        mouseEvent = {
            offsetX: 100,
            offsetY: 200,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update mousePosition when left mouse button is pressed', async () => {
        await service.mouseDrag(mouseEvent);
        const x = service.getX();
        const y = service.getY();
        expect(x).toEqual(mouseEvent.offsetX);
        expect(y).toEqual(mouseEvent.offsetY);
    });
});

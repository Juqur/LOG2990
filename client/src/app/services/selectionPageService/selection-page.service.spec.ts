import { TestBed } from '@angular/core/testing';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { LevelService } from '@app/services/levelService/level.service';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { SelectionPageService } from './selection-page.service';

describe('SelectionPageService', () => {
    let service: SelectionPageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppRoutingModule, AppMaterialModule],
            providers: [LevelService, SocketHandler, PopUpService],
        });
        service = TestBed.inject(SelectionPageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

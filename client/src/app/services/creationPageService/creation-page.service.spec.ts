import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { DifferenceDetectorService } from '@app/services/difference-detector.service';
import { MouseService } from '@app/services/mouse.service';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
import { of } from 'rxjs';
import { CreationPageService } from './creation-page.service';
import SpyObj = jasmine.SpyObj;

describe('CreationPageService', () => {
    let service: CreationPageService;
    // let canvasSharingService: CanvasSharingService;
    let mouseServiceSpy: SpyObj<MouseService>;
    const diffService = jasmine.createSpyObj('DifferenceDetectorService', ['detectDifferences']);
    const popUpService = jasmine.createSpyObj('PopUpServiceService', ['openDialog']);
    popUpService.dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
    popUpService.dialogRef.afterClosed.and.returnValue(of({ hasAccepted: true }));

    beforeEach(() => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['mouseHitDetect', 'getCanClick', 'getX', 'getY', 'changeClickState']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CanvasSharingService,
                HttpClient,
                HttpHandler,
                { provide: MouseService, useValue: mouseServiceSpy },
                { provide: DifferenceDetectorService, useValue: diffService },
                { provide: PopUpService, useValue: popUpService },
            ],
            imports: [AppMaterialModule, MatSliderModule, FormsModule, RouterTestingModule],
        });
        service = TestBed.inject(CreationPageService);
        // canvasSharingService = TestBed.inject(CanvasSharingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { MouseService } from '@app/services/mouse.service';
import { CreationComponent } from './creation.component';
import SpyObj = jasmine.SpyObj;

describe('CreationComponent', () => {
    let component: CreationComponent;
    let canvasSharingService: CanvasSharingService;
    let fixture: ComponentFixture<CreationComponent>;
    let mouseServiceSpy: SpyObj<MouseService>;
    
    beforeEach(() => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['mouseHitDetect', 'getCanClick', 'getX', 'getY', 'changeClickState']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationComponent],
            providers: [CanvasSharingService,{ provide: MouseService, useValue: mouseServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationComponent);
        canvasSharingService = TestBed.inject(CanvasSharingService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set defaultImage with selected file', () => {
        const mockFile = new File([''], 'mock.jpg');
        const mockEvent = { target: { files: [mockFile] } } as any;
        component.defaultImageSelector(mockEvent);
        expect(component.defaultImage).toEqual(mockFile);
    });

    it('defaultImageSelector should call showDefaultImage', () => {
        const mockFile = new File([''], 'mock.jpg');
        const mockFileInput = { target: { files: [mockFile] } } as any;
        const spy = spyOn(component, 'showDefaultImage');
        component.defaultImageSelector(mockFileInput);
        expect(spy).toHaveBeenCalled();
    });
    it('diffImageSelector should call showDiffImage', () => {
        const mockFile = new File([''], 'mock.jpg');
        const mockFileInput = { target: { files: [mockFile] } } as any;
        const spy = spyOn(component, 'showDiffImage');
        component.diffImageSelector(mockFileInput);
        expect(spy).toHaveBeenCalled();

    });
    it('bothImagesSelector should call both showDefaultImage and showDiffImage', () => {
        const mockFile = new File([''], 'mock.jpg');
        const mockFileInput = { target: { files: [mockFile] } } as any;
        const defaultSpy = spyOn(component, 'showDefaultImage');
        const diffSpy = spyOn(component, 'showDiffImage');
        component.bothImagesSelector(mockFileInput);
        expect(defaultSpy).toHaveBeenCalled();
        expect(diffSpy).toHaveBeenCalled();
    });

    it('showDefaultImage should show default image on canvas', () => {
        component.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.setDefaultCanvasRef(component.defaultCanvasCtx?.canvas as HTMLCanvasElement);
        const mockFile = new File([''], 'mock.jpg');
        component.defaultImage = mockFile;
        component.showDefaultImage();
        expect(canvasSharingService.defaultCanvasRef.width).toBeGreaterThan(0);
        expect(canvasSharingService.defaultCanvasRef.height).toBeGreaterThan(0);
    });

    it('showDiffImage should show diff image on canvas', () => {
        component.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.setDiffCanvasRef(component.diffCanvasCtx?.canvas as HTMLCanvasElement);
        const mockFile = new File([''], 'mock.jpg');
        component.diffImage = mockFile;
        component.showDiffImage();
        expect(canvasSharingService.diffCanvasRef.width).toBeGreaterThan(0);
        expect(canvasSharingService.diffCanvasRef.height).toBeGreaterThan(0);
    });

});

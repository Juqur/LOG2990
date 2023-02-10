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
            providers: [CanvasSharingService, { provide: MouseService, useValue: mouseServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationComponent);
        canvasSharingService = TestBed.inject(CanvasSharingService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('defaultImageSelector should set defaultImage with selected file', () => {
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        spyOn(component, 'showDefaultImage');
        const verifySpy = spyOn(component, 'verifyImageFormat');
        verifySpy.and.returnValue(Promise.resolve(true));
        component.defaultImageSelector(mockEvent);
        expect(component.defaultImageFile).toEqual(mockFile);
    });

    it('diffImageSelector should set diffImage with selected file', () => {
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        spyOn(component, 'showDiffImage');
        const verifySpy = spyOn(component, 'verifyImageFormat');
        verifySpy.and.returnValue(Promise.resolve(true));
        component.diffImageSelector(mockEvent);
        expect(component.diffImageFile).toEqual(mockFile);
    });

    it('bothImagesSelector should set defaultImage and diffImage with selected file', () => {
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        spyOn(component, 'showDefaultImage');
        spyOn(component, 'showDiffImage');
        const verifySpy = spyOn(component, 'verifyImageFormat');
        verifySpy.and.returnValue(Promise.resolve(true));
        component.bothImagesSelector(mockEvent);
        expect(component.defaultImageFile).toEqual(mockFile);
        expect(component.diffImageFile).toEqual(mockFile);
    });

    it('defaultImageSelector should call showDefaultImage if the image format is correct', async () => {
        const mockFile = new File([''], 'mock.bmp');
        const mockFileInput = { target: { files: [mockFile] } } as unknown as Event;
        const showImgSpy = spyOn(component, 'showDefaultImage');
        const verifySpy = spyOn(component, 'verifyImageFormat');
        verifySpy.and.returnValue(Promise.resolve(true));
        component.defaultImageSelector(mockFileInput);
        await Promise.resolve();
        expect(showImgSpy).toHaveBeenCalledTimes(1);
    });
    it('diffImageSelector should call showDiffImage if the image format is correct', async () => {
        const mockFile = new File([''], 'mock.bmp');
        const mockFileInput = { target: { files: [mockFile] } } as unknown as Event;
        const showImgSpy = spyOn(component, 'showDiffImage');
        const verifySpy = spyOn(component, 'verifyImageFormat');
        verifySpy.and.returnValue(Promise.resolve(true));
        component.diffImageSelector(mockFileInput);
        await Promise.resolve();
        expect(showImgSpy).toHaveBeenCalledTimes(1);
    });
    it('bothImagesSelector should call both showDefaultImage and showDiffImage if the image format is correct', async () => {
        const mockFile = new File([''], 'mock.bmp');
        const mockFileInput = { target: { files: [mockFile] } } as unknown as Event;
        const showDefaultSpy = spyOn(component, 'showDefaultImage');
        const showDiffSpy = spyOn(component, 'showDiffImage');
        const verifySpy = spyOn(component, 'verifyImageFormat');
        verifySpy.and.returnValue(Promise.resolve(true));
        component.bothImagesSelector(mockFileInput);
        await Promise.resolve();
        expect(showDefaultSpy).toHaveBeenCalled();
        expect(showDiffSpy).toHaveBeenCalled();
    });

    it('verifyImageFormat should return true if the image format is correct', (done) => {
        const imageSrc = './assets/test/image_7_diff.bmp';
        fetch(imageSrc).then(res => res.blob()).then(blob => {
            const goodFile = new File([blob], 'image_7_.bmp', { type: 'image/bmp' });
            component.verifyImageFormat(goodFile).then((result) => {
                expect(result).toBe(true);
                done();
            });
        });
    });

    it('verifyImageFormat should return false if the image format is incorrect', (done) => {
        const mockFile = new File([''], 'mock.mp4', { type: 'video/mp4' });
        component.verifyImageFormat(mockFile).then((result) => {
            expect(result).toBe(false);
            done();
        });
    });
});

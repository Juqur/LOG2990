import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { RouterTestingModule } from '@angular/router/testing';
/* import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';*/
import { AppMaterialModule } from '@app/modules/material.module';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';
// import { PopUpServiceService } from '@app/services/pop-up-service.service';
import { CreationComponent } from './creation.component';
import SpyObj = jasmine.SpyObj;

describe('CreationComponent', () => {
    let component: CreationComponent;

    // Nécessaire pour des futurs tests
    let canvasSharingService: CanvasSharingService;
    // let popUpService: PopUpServiceService;
    let fixture: ComponentFixture<CreationComponent>;
    let mouseServiceSpy: SpyObj<MouseService>;

    beforeEach(() => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['mouseHitDetect', 'getCanClick', 'getX', 'getY', 'changeClickState']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationComponent],
            providers: [CanvasSharingService, { provide: MouseService, useValue: mouseServiceSpy }],
            imports: [AppMaterialModule, MatSliderModule, FormsModule, RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationComponent);

        // Nécessaire pour des futurs tests
        canvasSharingService = TestBed.inject(CanvasSharingService);
        // popUpService = TestBed.inject(PopUpServiceService);
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
    it('defaultImageSelector should not call showDefaultImage if there is not file input', () => {
        const showImgSpy = spyOn(component, 'showDefaultImage');
        const event = { target: {} } as unknown as Event;
        component.defaultImageSelector(event);
        expect(showImgSpy).toHaveBeenCalledTimes(0);
    });
    it('diffImageSelector should not call showDiffImage if there is not file input', () => {
        const showImgSpy = spyOn(component, 'showDiffImage');
        const event = { target: {} } as unknown as Event;
        component.diffImageSelector(event);
        expect(showImgSpy).toHaveBeenCalledTimes(0);
    });
    it('bothImagesSelector should not call showDefaultImage or showDiffImage if there is not file input', () => {
        const showDefaultSpy = spyOn(component, 'showDefaultImage');
        const showDiffSpy = spyOn(component, 'showDiffImage');
        const event = { target: {} } as unknown as Event;
        component.bothImagesSelector(event);
        expect(showDefaultSpy).toHaveBeenCalledTimes(0);
        expect(showDiffSpy).toHaveBeenCalledTimes(0);
    });

    it('defaultImageSelector should not call showDefaultImage if the image format is incorrect', async () => {
        const mockFile = new File([''], 'mock.mp4');
        const mockFileInput = { target: { files: [mockFile] } } as unknown as Event;
        const showImgSpy = spyOn(component, 'showDefaultImage');
        spyOn(component, 'verifyImageFormat').and.returnValue(Promise.resolve(false));
        component.defaultImageSelector(mockFileInput);
        await Promise.resolve();
        expect(showImgSpy).toHaveBeenCalledTimes(0);
    });
    it('diffImageSelector should not call showDiffImage if the image format is incorrect', async () => {
        const mockFile = new File([''], 'mock.mp4');
        const mockFileInput = { target: { files: [mockFile] } } as unknown as Event;
        const showImgSpy = spyOn(component, 'showDiffImage');
        spyOn(component, 'verifyImageFormat').and.returnValue(Promise.resolve(false));
        component.diffImageSelector(mockFileInput);
        await Promise.resolve();
        expect(showImgSpy).toHaveBeenCalledTimes(0);
    });
    it('bothImagesSelector should not call showDefaultImage or showDiffImage if the image format is incorrect', async () => {
        const mockFile = new File([''], 'mock.mp4');
        const mockFileInput = { target: { files: [mockFile] } } as unknown as Event;
        const showDefaultSpy = spyOn(component, 'showDefaultImage');
        const showDiffSpy = spyOn(component, 'showDiffImage');
        spyOn(component, 'verifyImageFormat').and.returnValue(Promise.resolve(false));
        component.bothImagesSelector(mockFileInput);
        await Promise.resolve();
        expect(showDefaultSpy).toHaveBeenCalledTimes(0);
        expect(showDiffSpy).toHaveBeenCalledTimes(0);
    });

    it('cleanSrc should empty the target value', () => {
        const target = document.createElement('input');
        target.value = 'mock';
        const event = { target } as unknown as Event;
        component.cleanSrc(event);
        expect(target.value).toBe('');
    });

    it('showDefaultImage should call errorDialog if there is no default image file', () => {
        const errorSpy = spyOn(component, 'errorDialog');
        const imageCreationSpy = spyOn(URL, 'createObjectURL');
        component.defaultImageFile = null;
        component.showDefaultImage();
        expect(imageCreationSpy).toHaveBeenCalledTimes(0);
        expect(errorSpy).toHaveBeenCalledOnceWith('aucun fichier de base');
    });
    it('showDiffImage should call errorDialog if there is no diff image file', () => {
        const errorSpy = spyOn(component, 'errorDialog');
        const imageCreationSpy = spyOn(URL, 'createObjectURL');
        component.diffImageFile = null;
        component.showDiffImage();
        expect(imageCreationSpy).toHaveBeenCalledTimes(0);
        expect(errorSpy).toHaveBeenCalledOnceWith('aucun fichier de différence');
    });
    it('showDefaultImage should show default image on canvas if the image format is correct', (done) => {
        component.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.setDefaultCanvasRef(component.defaultCanvasCtx?.canvas as HTMLCanvasElement);
        const mockFile = new File([''], 'mock.bmp');
        component.defaultImageFile = mockFile;
        spyOn(URL, 'createObjectURL').and.returnValue('./assets/test/image_7_diff.bmp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const drawSpy = spyOn<any>(canvasSharingService.defaultCanvasRef.getContext('2d'), 'drawImage').and.callThrough();
        component.showDefaultImage();
        setTimeout(() => {
            expect(drawSpy).toHaveBeenCalled();
            expect(canvasSharingService.defaultCanvasRef.width).toEqual(Constants.EXPECTED_WIDTH);
            expect(canvasSharingService.defaultCanvasRef.height).toEqual(Constants.EXPECTED_HEIGHT);
            done();
        }, Constants.thousand);
    });
    it('showDiffImage should show diff image on canvas if the image format is correct', (done) => {
        component.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.setDiffCanvasRef(component.diffCanvasCtx?.canvas as HTMLCanvasElement);
        const mockFile = new File([''], 'mock.bmp');
        component.diffImageFile = mockFile;
        spyOn(URL, 'createObjectURL').and.returnValue('./assets/test/image_7_diff.bmp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const drawSpy = spyOn<any>(canvasSharingService.diffCanvasRef.getContext('2d'), 'drawImage').and.callThrough();
        component.showDiffImage();
        setTimeout(() => {
            expect(drawSpy).toHaveBeenCalled();
            expect(canvasSharingService.diffCanvasRef.width).toEqual(Constants.EXPECTED_WIDTH);
            expect(canvasSharingService.diffCanvasRef.height).toEqual(Constants.EXPECTED_HEIGHT);
            done();
        }, Constants.thousand);
    });
    it('showDefaultImage should call errorDialog and not show  image on canvas if there is no canvas context', (done) => {
        component.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.setDefaultCanvasRef(component.defaultCanvasCtx?.canvas as HTMLCanvasElement);
        const mockFile = new File([''], 'mock.bmp');
        component.defaultImageFile = mockFile;
        spyOn(URL, 'createObjectURL').and.returnValue('./assets/test/image_7_diff.bmp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const drawSpy = spyOn<any>(canvasSharingService.defaultCanvasRef.getContext('2d'), 'drawImage');
        const errorSpy = spyOn(component, 'errorDialog');
        component.defaultCanvasCtx = null;
        component.showDefaultImage();
        setTimeout(() => {
            expect(errorSpy).toHaveBeenCalledOnceWith('aucun canvas de base');
            expect(drawSpy).toHaveBeenCalledTimes(0);
            done();
        }, Constants.thousand);
    });
    it('showDiffImage should call errorDialog and not show image on canvas if there is no canvas context', (done) => {
        component.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.setDiffCanvasRef(component.diffCanvasCtx?.canvas as HTMLCanvasElement);
        const mockFile = new File([''], 'mock.bmp');
        component.diffImageFile = mockFile;
        spyOn(URL, 'createObjectURL').and.returnValue('./assets/test/image_7_diff.bmp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const drawSpy = spyOn<any>(canvasSharingService.diffCanvasRef.getContext('2d'), 'drawImage');
        const errorSpy = spyOn(component, 'errorDialog');
        component.diffCanvasCtx = null;
        component.showDiffImage();
        setTimeout(() => {
            expect(errorSpy).toHaveBeenCalledOnceWith('aucun canvas de différence');
            expect(drawSpy).toHaveBeenCalledTimes(0);
            done();
        }, Constants.thousand);
    });
    it('showDefaultImage should call dialog and not show image if the image res is incorrect', (done) => {
        component.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.setDefaultCanvasRef(component.defaultCanvasCtx?.canvas as HTMLCanvasElement);
        const mockFile = new File([''], 'mock.bmp');
        component.defaultImageFile = mockFile;
        spyOn(URL, 'createObjectURL').and.returnValue('./assets/test/image_wrong_res.bmp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const drawSpy = spyOn<any>(canvasSharingService.defaultCanvasRef.getContext('2d'), 'drawImage');
        const errorSpy = spyOn(component, 'errorDialog');
        component.showDefaultImage();
        setTimeout(() => {
            expect(errorSpy).toHaveBeenCalledOnceWith('Les images doivent être de taille 640x480');
            expect(drawSpy).toHaveBeenCalledTimes(0);
            done();
        }, Constants.thousand);
    });
    it('showDiffImage should call dialog and not show image if the image res is incorrect', (done) => {
        component.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.setDiffCanvasRef(component.diffCanvasCtx?.canvas as HTMLCanvasElement);
        const mockFile = new File([''], 'mock.bmp');
        component.diffImageFile = mockFile;
        spyOn(URL, 'createObjectURL').and.returnValue('./assets/test/image_wrong_res.bmp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const drawSpy = spyOn<any>(canvasSharingService.diffCanvasRef.getContext('2d'), 'drawImage');
        const errorSpy = spyOn(component, 'errorDialog');
        component.showDiffImage();
        setTimeout(() => {
            expect(errorSpy).toHaveBeenCalledOnceWith('Les images doivent être de taille 640x480');
            expect(drawSpy).toHaveBeenCalledTimes(0);
            done();
        }, Constants.thousand);
    });

    it('verifyImageFormat should return true if the image format is correct', (done) => {
        const imageSrc = './assets/test/image_7_diff.bmp';
        fetch(imageSrc)
            .then(async (res) => res.blob())
            .then((blob) => {
                const goodFile = new File([blob], 'image_7_.bmp', { type: 'image/bmp' });
                component.verifyImageFormat(goodFile).then((result) => {
                    expect(result).toBe(true);
                    done();
                });
            });
    });
    it('verifyImageFormat should return false if the image format is incorrect', (done) => {
        const mockFile = new File([''], 'mock.mp4', { type: 'video/mp4' });
        spyOn(component, 'errorDialog');
        component.verifyImageFormat(mockFile).then((result) => {
            expect(result).toBe(false);
            done();
        });
    });
    it('verifyImageFormat should return false if the image bitDept is incorrect', (done) => {
        const errorSpy = spyOn(component, 'errorDialog');
        const imageSrc = './assets/test/image_wrong_bit_depth.bmp';
        fetch(imageSrc)
            .then(async (res) => res.blob())
            .then((blob) => {
                const goodFile = new File([blob], 'image_wrong_bit_depth.bmp', { type: 'image/bmp' });
                component.verifyImageFormat(goodFile).then((result) => {
                    expect(result).toBe(false);
                    expect(errorSpy).toHaveBeenCalledOnceWith('Les images doivent être de 24 bits par pixel');
                    done();
                });
            });
    });
});

import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { DifferenceDetectorService } from '@app/services/differenceDetectorService/difference-detector.service';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
import { Constants } from '@common/constants';
import { of } from 'rxjs';
import { CreationComponent } from './creation.component';
import SpyObj = jasmine.SpyObj;

describe('CreationComponent', () => {
    let component: CreationComponent;
    let canvasSharingService: CanvasSharingService;
    let fixture: ComponentFixture<CreationComponent>;
    let mouseServiceSpy: SpyObj<MouseService>;
    // let differenceDetectorService: DifferenceDetectorService;
    // let popUpServiceService: PopUpServiceService;

    const diffService = jasmine.createSpyObj('DifferenceDetectorService', ['detectDifferences']);
    const popUpService = jasmine.createSpyObj('PopUpServiceService', ['openDialog']);
    popUpService.dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
    popUpService.dialogRef.afterClosed.and.returnValue(of({ hasAccepted: true }));
    beforeEach(() => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['mouseHitDetect', 'getCanClick', 'getX', 'getY', 'changeClickState']);
    });
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationComponent, ScaleContainerComponent, PlayAreaComponent],
            providers: [
                CanvasSharingService,
                HttpClient,
                HttpHandler,
                { provide: MouseService, useValue: mouseServiceSpy },
                { provide: DifferenceDetectorService, useValue: diffService },
                { provide: PopUpService, useValue: popUpService },
            ],
            imports: [AppMaterialModule, MatSliderModule, FormsModule, RouterTestingModule],
        }).compileComponents();
        fixture = TestBed.createComponent(CreationComponent);
        component = fixture.componentInstance;
        canvasSharingService = TestBed.inject(CanvasSharingService);
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('ImageSelectors should individually set defaultImage with selected file', () => {
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        const verifySpy = spyOn(component, 'verifyImageFormat');
        verifySpy.and.returnValue(Promise.resolve(true));
        spyOn(component, 'showDefaultImage');
        spyOn(component, 'showDiffImage');
        component.defaultImageSelector(mockEvent);
        component.diffImageSelector(mockEvent);
        expect(component.defaultImageFile).toEqual(mockFile);
        expect(component.diffImageFile).toEqual(mockFile);
    });
    it('bothImagesSelector should set defaultImage and diffImage with selected file', () => {
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        const verifySpy = spyOn(component, 'verifyImageFormat');
        verifySpy.and.returnValue(Promise.resolve(true));
        spyOn(component, 'showDefaultImage');
        spyOn(component, 'showDiffImage');
        component.bothImagesSelector(mockEvent);
        expect(component.defaultImageFile).toEqual(mockFile);
        expect(component.diffImageFile).toEqual(mockFile);
    });
    it('ImageSelectors should individually call showImage functions if the image format is correct', async () => {
        const mockFile = new File([''], 'mock.bmp');
        const mockFileInput = { target: { files: [mockFile] } } as unknown as Event;
        const defaultImgSpy = spyOn(component, 'showDefaultImage');
        const verifySpy = spyOn(component, 'verifyImageFormat');
        const diffImgSpy = spyOn(component, 'showDiffImage');
        verifySpy.and.returnValue(Promise.resolve(true));
        component.defaultImageSelector(mockFileInput);
        component.diffImageSelector(mockFileInput);
        await Promise.resolve();
        expect(defaultImgSpy).toHaveBeenCalledTimes(1);
        expect(diffImgSpy).toHaveBeenCalledTimes(1);
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
    it('ImageSelectors should not call showImage functions if there is no file input', () => {
        const defaultImgSpy = spyOn(component, 'showDefaultImage');
        const diffImgSpy = spyOn(component, 'showDiffImage');
        const event = { target: {} } as unknown as Event;
        component.defaultImageSelector(event);
        component.diffImageSelector(event);
        expect(defaultImgSpy).toHaveBeenCalledTimes(0);
        expect(diffImgSpy).toHaveBeenCalledTimes(0);
    });
    it('bothImagesSelector should not call showDefaultImage or showDiffImage if there is no file input', () => {
        const showDefaultSpy = spyOn(component, 'showDefaultImage');
        const showDiffSpy = spyOn(component, 'showDiffImage');
        const event = { target: {} } as unknown as Event;
        component.bothImagesSelector(event);
        expect(showDefaultSpy).toHaveBeenCalledTimes(0);
        expect(showDiffSpy).toHaveBeenCalledTimes(0);
    });
    it('ImageSelectors should not call showImage functions if the image format is incorrect', async () => {
        const mockFile = new File([''], 'mock.mp4');
        const mockFileInput = { target: { files: [mockFile] } } as unknown as Event;
        const defaultImgSpy = spyOn(component, 'showDefaultImage');
        const diffImgSpy = spyOn(component, 'showDiffImage');
        spyOn(component, 'verifyImageFormat').and.returnValue(Promise.resolve(false));
        component.defaultImageSelector(mockFileInput);
        component.diffImageSelector(mockFileInput);
        await Promise.resolve();
        expect(defaultImgSpy).toHaveBeenCalledTimes(0);
        expect(diffImgSpy).toHaveBeenCalledTimes(0);
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
    it('showImage functions should call errorDialog if there is no default image file', () => {
        const errorSpy = spyOn(component, 'errorDialog');
        const imageCreationSpy = spyOn(URL, 'createObjectURL');
        component.defaultImageFile = null;
        component.diffImageFile = null;
        component.showDefaultImage();
        component.showDiffImage();
        expect(imageCreationSpy).toHaveBeenCalledTimes(0);
        expect(errorSpy).toHaveBeenCalledTimes(2);
        expect(errorSpy).toHaveBeenCalledWith('aucun fichier de base');
    });
    it('showImage functions should show images on canvas if the image format is correct', (done) => {
        component.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.defaultCanvas = component.defaultCanvasCtx?.canvas as HTMLCanvasElement;
        component.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.diffCanvas = component.diffCanvasCtx?.canvas as HTMLCanvasElement;
        const mockFile = new File([''], 'mock.bmp');
        component.defaultImageFile = mockFile;
        component.diffImageFile = mockFile;
        spyOn(URL, 'createObjectURL').and.returnValue('./assets/test/image_7_diff.bmp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defaultDrawSpy = spyOn<any>(canvasSharingService.defaultCanvas.getContext('2d'), 'drawImage').and.callThrough();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const diffDrawSpy = spyOn<any>(canvasSharingService.diffCanvas.getContext('2d'), 'drawImage').and.callThrough();
        component.showDefaultImage();
        component.showDiffImage();
        setTimeout(() => {
            expect(defaultDrawSpy).toHaveBeenCalled();
            expect(diffDrawSpy).toHaveBeenCalled();
            expect(canvasSharingService.defaultCanvas.width).toEqual(Constants.EXPECTED_WIDTH);
            expect(canvasSharingService.defaultCanvas.height).toEqual(Constants.EXPECTED_HEIGHT);
            expect(canvasSharingService.diffCanvas.width).toEqual(Constants.EXPECTED_WIDTH);
            expect(canvasSharingService.diffCanvas.height).toEqual(Constants.EXPECTED_HEIGHT);
            done();
        }, Constants.thousand);
    });
    it('showImage functions should call errorDialog and not show  image on canvas if there is no canvas context', (done) => {
        component.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.defaultCanvas = component.defaultCanvasCtx?.canvas as HTMLCanvasElement;
        const mockFile = new File([''], 'mock.bmp');
        component.defaultImageFile = mockFile;
        component.diffImageFile = mockFile;
        spyOn(URL, 'createObjectURL').and.returnValue('./assets/test/image_7_diff.bmp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defaultDrawSpy = spyOn<any>(canvasSharingService.defaultCanvas.getContext('2d'), 'drawImage');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const diffDrawSpy = spyOn<any>(canvasSharingService.diffCanvas.getContext('2d'), 'drawImage');
        const errorSpy = spyOn(component, 'errorDialog');
        component.defaultCanvasCtx = null;
        component.diffCanvasCtx = null;
        component.showDefaultImage();
        component.showDiffImage();
        setTimeout(() => {
            expect(errorSpy).toHaveBeenCalledTimes(2);
            expect(errorSpy).toHaveBeenCalledWith('aucun canvas de base');
            expect(defaultDrawSpy).toHaveBeenCalledTimes(0);
            expect(diffDrawSpy).toHaveBeenCalledTimes(0);
            done();
        }, Constants.thousand);
    });
    it('showImage functions should call dialog and not show image if the image res is incorrect', (done) => {
        component.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.defaultCanvas = component.defaultCanvasCtx?.canvas as HTMLCanvasElement;
        component.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        canvasSharingService.diffCanvas = component.diffCanvasCtx?.canvas as HTMLCanvasElement;
        const mockFile = new File([''], 'mock.bmp');
        component.defaultImageFile = mockFile;
        component.diffImageFile = mockFile;
        spyOn(URL, 'createObjectURL').and.returnValue('./assets/test/image_wrong_res.bmp');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defaultDrawSpy = spyOn<any>(canvasSharingService.defaultCanvas.getContext('2d'), 'drawImage');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const diffDrawSpy = spyOn<any>(canvasSharingService.diffCanvas.getContext('2d'), 'drawImage');
        const errorSpy = spyOn(component, 'errorDialog');
        component.showDefaultImage();
        component.showDiffImage();
        setTimeout(() => {
            expect(errorSpy).toHaveBeenCalledTimes(2);
            expect(errorSpy).toHaveBeenCalledWith('Les images doivent être de taille 640x480');
            expect(defaultDrawSpy).toHaveBeenCalledTimes(0);
            expect(diffDrawSpy).toHaveBeenCalledTimes(0);
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
    it('resetDefault/Diff should call reinitGame and clear the canvas', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clearDefaultSpy = spyOn<any>(canvasSharingService.defaultCanvas.getContext('2d'), 'drawImage');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clearDiffSpy = spyOn<any>(canvasSharingService.diffCanvas.getContext('2d'), 'drawImage');
        const reinitSpy = spyOn(component, 'reinitGame');
        component.resetDefault();
        component.resetDiff();
        setTimeout(() => {
            expect(clearDefaultSpy).toHaveBeenCalledTimes(1);
            expect(clearDiffSpy).toHaveBeenCalledTimes(1);
            expect(reinitSpy).toHaveBeenCalledTimes(2);
            done();
        }, Constants.hundred);
    });
    it('sliderChange should change value of the radius ', () => {
        for (let i = 0; i < Constants.RADIUS_TABLE.length; i++) {
            component.sliderChange(i);
            expect(component.radius).toBe(Constants.RADIUS_TABLE[i]);
        }
    });
    it('DetectDifference should call errorDialog if there is no canvasCtx', () => {
        const errorSpy = spyOn(component, 'errorDialog');
        component.defaultCanvasCtx = null;
        component.detectDifference();
        expect(errorSpy).toHaveBeenCalledOnceWith('Canvas manquant');
    });
    it('DetectDifference should call popUpService if detectDifferencesService returns null', () => {
        const errorSpy = spyOn(component, 'errorDialog');
        diffService.detectDifferences.and.returnValue(null);
        component.detectDifference();
        expect(diffService.detectDifferences).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledOnceWith('Veuillez fournir des images non vides');
    });
    it('DetectDifference should call detectDifferencesService and open dialog to show changes', () => {
        const differences = {
            clusters: [],
            isHard: false,
            canvas: document.createElement('canvas').getContext('2d'),
        };
        diffService.detectDifferences.and.returnValue(differences);
        component.detectDifference();
        expect(component.nbDifferences).not.toBeNull();
        expect(diffService.detectDifferences).toHaveBeenCalled();
        expect(popUpService.openDialog).toHaveBeenCalled();
    });
    it('saveGame should ask for game name by opening dialog', () => {
        const mockFile = new File([''], 'mock.bmp');
        component.diffImageFile = mockFile;
        component.isSaveable = true;
        popUpService.openDialog.and.returnValue({
            afterClosed: () =>
                of({
                    hasAccepted: true,
                }),
        });
        popUpService.result = 'nom';
        component.saveGame();
        expect(popUpService.openDialog).toHaveBeenCalled();
    });
    it('saveGame should errorDialog if there is no img file', () => {
        component.diffImageFile = null;
        component.isSaveable = true;
        const errorSpy = spyOn(component, 'errorDialog');
        component.saveGame();
        expect(errorSpy).toHaveBeenCalled();
    });
    it('errorDialog should close the currently opened dialog and open dialog', () => {
        component.errorDialog('un');
        component.errorDialog('deux');
        expect(popUpService.openDialog).toHaveBeenCalled();
        expect(popUpService.dialogRef.close).toHaveBeenCalled();
    });
});

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { LevelFormData } from '@common/levelFormData';
import { Message } from '@common/message';
import { environment } from 'src/environments/environment';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call http GET with a id', () => {
        const fakeLevel = {
            id: 1,
            name: '',
            playerSolo: [],
            timeSolo: [],
            playerMulti: [],
            timeMulti: [],
            isEasy: true,
            nbDifferences: 0,
        };
        service.getLevel(1).subscribe((res) => {
            expect(res).toEqual(fakeLevel);
        });

        const req = httpMock.expectOne(environment.serverUrl + 'api/image/1');
        expect(req.request.method).toEqual('GET');
        req.flush(fakeLevel);
    });

    it('should make an http GET request for levels', () => {
        const path = '/image/allLevels';
        const levels = [
            { id: 1, name: 'Level 1' },
            { id: 2, name: 'Level 2' },
        ] as Level[];

        service.getLevels().subscribe((response) => {
            expect(response).toEqual(levels);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}api${path}`);
        expect(req.request.method).toEqual('GET');
        req.flush(levels);
    });

    it('should make an http POST request for difference count', () => {
        const differenceFile = 'someFile';
        const expectedDifferences = [0, 1, 2];

        service.postDifference(differenceFile, 1).subscribe((response) => {
            expect(response).toEqual(expectedDifferences);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}api/game/difference`);
        expect(req.request.method).toEqual('POST');
        req.flush(expectedDifferences);
    });

    it('should make an http POST request for level', () => {
        const blob = new Blob([''], { type: 'text/html' });
        const level: LevelFormData = {
            imageOriginal: blob as File,
            imageDiff: blob as File,
            name: '',
            isEasy: '',
            clusters: '',
            nbDifferences: '',
        };
        const fakeMessage = { title: 'Hello, world!', body: 'Successfully received' } as Message;

        service.postLevel(level).subscribe((response) => {
            expect(response).toEqual(fakeMessage);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}api/image/postLevel`);
        expect(req.request.method).toEqual('POST');
        req.flush(fakeMessage);
    });

    it('postDifference should return an empty array if response body is falsy', () => {
        const fakeGameId = '1';
        const fakePosition = 2;
        const fakeResponse = [] as number[];

        service.postDifference(fakeGameId, fakePosition).subscribe((res) => {
            expect(res).toEqual(fakeResponse);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}api/game/difference`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual({ gameId: '1', position: 2 });
        req.flush(null);
    });

    it('should make an http POST request new game', () => {
        const imageName = 'someImage';

        service.postNewGame(imageName).subscribe((res) => {
            expect(res).toEqual(imageName);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}api/game`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual({ imageId: 'someImage' });
        req.flush(imageName);
    });

    it('should make an http DELETE request a level', () => {
        service.deleteLevel(1).subscribe((res) => {
            expect(res).toBeTruthy();
        });

        const req = httpMock.expectOne(environment.serverUrl + 'api/image/1');
        expect(req.request.method).toEqual('DELETE');
        req.flush('1');
    });

    it('handleError should handle error', () => {
        const request = 'GET /api/data';
        const result = { data: 'test' };
        const error = new Error('Something went wrong');
        const handleError = service['handleError'](request, result);
        const observable = handleError(error);
        observable
            .subscribe((value) => {
                expect(value).toEqual(result);
            })
            .unsubscribe();
    });
});

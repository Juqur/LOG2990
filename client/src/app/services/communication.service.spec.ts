import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communication.service';
import { Message } from '@common/message';

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

    it('Get level should call http get with a id', () => {
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

        const req = httpMock.expectOne('http://localhost:3000/api/image/1');
        expect(req.request.method).toEqual('GET');
        req.flush(fakeLevel);
    });

    it('getMessage should call http get with the correct path', () => {
        const fakeMessage = { title: 'Hello, world!', body: 'the code works' } as Message;
        const path = '/some/path';

        service.getMessage(path).subscribe((res) => {
            expect(res).toEqual(fakeMessage);
        });

        const req = httpMock.expectOne(`http://localhost:3000/api${path}`);
        expect(req.request.method).toEqual('GET');
        req.flush(fakeMessage);
    });

    it('should make an http GET request for levels', () => {
        const path = '/image/allLevels';
        const levels = [
            { id: 1, name: 'Level 1' },
            { id: 2, name: 'Level 2' },
        ] as Level[];

        service.getLevels(path).subscribe((response) => {
            expect(response).toEqual(levels);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}api${path}`);
        expect(req.request.method).toEqual('GET');
        req.flush(levels);
    });

    it('should make an http GET request for an unknown type', () => {
        const path = '/unknown';
        const data = 'response data';

        service.get(path).subscribe((response) => {
            expect(response).toEqual(data);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}api${path}`);
        expect(req.request.method).toEqual('GET');
        req.flush(data);
    });

    it('should make an http GET request for difference count', () => {
        const differenceFile = 'someFile';
        const count = 5;

        service.getDifferenceCount(differenceFile).subscribe((response) => {
            expect(response).toEqual(count);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}api/image/differenceCount/${differenceFile}`);
        expect(req.request.method).toEqual('GET');
        req.flush(count);
    });
});

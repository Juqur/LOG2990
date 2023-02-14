import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';

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
});

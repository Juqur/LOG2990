import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { Constants } from '@common/constants';
import { TestConstants } from '@common/test-constants';
import { of } from 'rxjs';
import { LevelService } from './level.service';
import SpyObj = jasmine.SpyObj;

describe('LevelService', () => {
    let service: LevelService;
    let communicationServiceMock: SpyObj<CommunicationService>;
    const levelExpectedArray: Level[] = [
        {
            id: 1,
            name: 'Test',
            playerSolo: ['Bot1', 'Bot2', 'Bot3'],
            timeSolo: [
                TestConstants.TIME_CONSTANTS_SOLO.sixty,
                TestConstants.TIME_CONSTANTS_SOLO.sixty_five,
                TestConstants.TIME_CONSTANTS_SOLO.seventy,
            ],
            playerMulti: ['Bot1', 'Bot2', 'Bot3'],
            timeMulti: [
                TestConstants.TIME_CONSTANTS_MULTI.eighty,
                TestConstants.TIME_CONSTANTS_MULTI.eighty_three,
                TestConstants.TIME_CONSTANTS_MULTI.ninety,
            ],
            isEasy: true,
            nbDifferences: 7,
        },
        {
            id: 2,
            name: 'Juan Cena',
            playerSolo: ['Bot1', 'Bot2', 'Bot3'],
            timeSolo: [
                TestConstants.TIME_CONSTANTS_SOLO.sixty,
                TestConstants.TIME_CONSTANTS_SOLO.sixty_five,
                TestConstants.TIME_CONSTANTS_SOLO.seventy,
            ],
            playerMulti: ['Bot1', 'Bot2', 'Bot3'],
            timeMulti: [
                TestConstants.TIME_CONSTANTS_MULTI.eighty,
                TestConstants.TIME_CONSTANTS_MULTI.eighty_three,
                TestConstants.TIME_CONSTANTS_MULTI.ninety,
            ],
            isEasy: true,
            nbDifferences: 5,
        },
        {
            id: 3,
            name: 'Soccer',
            playerSolo: ['Bot1', 'Bot2', 'Bot3'],
            timeSolo: [
                TestConstants.TIME_CONSTANTS_SOLO.sixty,
                TestConstants.TIME_CONSTANTS_SOLO.sixty_five,
                TestConstants.TIME_CONSTANTS_SOLO.seventy,
            ],
            playerMulti: ['Bot1', 'Bot2', 'Bot3'],
            timeMulti: [
                TestConstants.TIME_CONSTANTS_MULTI.eighty,
                TestConstants.TIME_CONSTANTS_MULTI.eighty_three,
                TestConstants.TIME_CONSTANTS_MULTI.ninety,
            ],
            isEasy: true,
            nbDifferences: 6,
        },
        {
            id: 4,
            name: 'Mirage',
            playerSolo: ['Bot1', 'Bot2', 'Bot3'],
            timeSolo: [
                TestConstants.TIME_CONSTANTS_SOLO.sixty,
                TestConstants.TIME_CONSTANTS_SOLO.sixty_five,
                TestConstants.TIME_CONSTANTS_SOLO.seventy,
            ],
            playerMulti: ['Bot1', 'Bot2', 'Bot3'],
            timeMulti: [
                TestConstants.TIME_CONSTANTS_MULTI.eighty,
                TestConstants.TIME_CONSTANTS_MULTI.eighty_three,
                TestConstants.TIME_CONSTANTS_MULTI.ninety,
            ],
            isEasy: false,
            nbDifferences: 8,
        },
        {
            id: 5,
            name: 'GreatMovi',
            playerSolo: ['Bot1', 'Bot2', 'Bot3'],
            timeSolo: [
                TestConstants.TIME_CONSTANTS_SOLO.sixty,
                TestConstants.TIME_CONSTANTS_SOLO.sixty_five,
                TestConstants.TIME_CONSTANTS_SOLO.seventy,
            ],
            playerMulti: ['Bot1', 'Bot2', 'Bot3'],
            timeMulti: [
                TestConstants.TIME_CONSTANTS_MULTI.eighty,
                TestConstants.TIME_CONSTANTS_MULTI.eighty_three,
                TestConstants.TIME_CONSTANTS_MULTI.ninety,
            ],
            isEasy: true,
            nbDifferences: 5,
        },
    ];

    beforeEach(() => {
        communicationServiceMock = jasmine.createSpyObj('CommunicationService', ['getLevels']);
        communicationServiceMock.getLevels.and.returnValue(of(levelExpectedArray));
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: CommunicationService, useValue: communicationServiceMock }],
        });
        service = TestBed.inject(LevelService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Constructor should correctly initialize class attributes', () => {
        expect(service['levels']).toEqual(levelExpectedArray);
        expect(service['currentShownPage']).toEqual(0);
        expect(service['shownLevels']).toEqual(levelExpectedArray.slice(0, Constants.levelsPerPage));
    });

    it('next page should increment page count and update the levels to show', () => {
        service.nextPage();
        expect(service['currentShownPage']).toEqual(1);
        expect(service['shownLevels']).toEqual(levelExpectedArray.slice(Constants.levelsPerPage, levelExpectedArray.length));
    });
});

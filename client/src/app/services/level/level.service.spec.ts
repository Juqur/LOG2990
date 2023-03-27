import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Constants } from '@common/constants';
import { TestConstants } from '@common/test-constants';
import { of } from 'rxjs';
import { LevelService } from './level.service';
import SpyObj = jasmine.SpyObj;

describe('LevelService', () => {
    let service: LevelService;
    let communicationServiceMock: SpyObj<CommunicationService>;
    let socketHandlerMock: SpyObj<SocketHandler>;
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
        communicationServiceMock = jasmine.createSpyObj('CommunicationService', ['getLevels', 'deleteLevel']);
        socketHandlerMock = jasmine.createSpyObj('SocketHandler', ['isSocketAlive', 'connect', 'send']);
        communicationServiceMock.getLevels.and.returnValue(of(levelExpectedArray));
        communicationServiceMock.deleteLevel.and.returnValue(of(true));

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceMock },
                { provide: SocketHandler, useValue: socketHandlerMock },
            ],
        });
        service = TestBed.inject(LevelService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('constructor', () => {
        it('should correctly initialize class attributes', () => {
            expect(service['levels']).toEqual(levelExpectedArray);
            expect(service['currentShownPage']).toEqual(0);
            expect(service['shownLevels']).toEqual(levelExpectedArray.slice(0, Constants.levelsPerPage));
        });
    });

    describe('allLevels', () => {
        it('should return all ', () => {
            expect(service.allLevels).toEqual(levelExpectedArray);
        });
    });

    describe('levelsToShow', () => {
        it('should return the correct levels to show', () => {
            expect(service.levelsToShow).toEqual(levelExpectedArray.slice(0, Constants.levelsPerPage));
        });
    });

    describe('currentPage', () => {
        it('should return the correct page', () => {
            expect(service.currentPage).toEqual(0);
        });
    });

    describe('lastPage', () => {
        it('should return the correct last page', () => {
            expect(service.lastPage).toEqual(1);
        });
    });

    describe('nextPage', () => {
        it('should increment page count and call updatePageLevels', () => {
            const spy = spyOn(service, 'updatePageLevels' as never);
            service.nextPage();
            expect(service['currentShownPage']).toEqual(1);
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('previousPage', () => {
        it('previous page should decrement the page count and call updatePageLevels', () => {
            const spy = spyOn(service, 'updatePageLevels' as never);
            service['currentShownPage'] = 1;
            service['shownLevels'] = levelExpectedArray.slice(Constants.levelsPerPage, levelExpectedArray.length);
            service.previousPage();
            expect(service['currentShownPage']).toEqual(0);
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('isBeginningOfList', () => {
        it('should correctly determine if we are at the start page', () => {
            expect(service.isBeginningOfList()).toEqual(true);
            service['currentShownPage'] = 1;
            expect(service.isBeginningOfList()).toEqual(false);
        });
    });

    describe('isEndOfList', () => {
        it('should correctly determine if we are at the last page', () => {
            expect(service.isEndOfList()).toEqual(false);
            service['currentShownPage'] = 1;
            expect(service.isEndOfList()).toEqual(true);
        });
    });

    describe('deleteLevel', () => {
        it('deleteLevel should call removeCard', () => {
            const levelId = 1;
            const spy = spyOn(service, 'removeCard' as never);
            service.deleteLevel(levelId);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call connect if the socket is not alive', () => {
            const levelId = 1;
            socketHandlerMock.isSocketAlive.and.returnValue(false);
            service.deleteLevel(levelId);
            expect(socketHandlerMock.connect).toHaveBeenCalledTimes(1);
        });

        it('should call send', () => {
            const levelId = 1;
            service.deleteLevel(levelId);
            expect(socketHandlerMock.send).toHaveBeenCalledWith('game', 'onDeleteLevel', levelId);
        });
    });

    describe('removeCard', () => {
        it('removeCard should correctly remove the card', () => {
            const levelId = 1;
            service['levels'] = [{ id: 1 } as Level, { id: 2 } as Level, { id: 3 } as Level];
            service['removeCard'](levelId);
            expect(service['levels']).toEqual([{ id: 2 } as Level, { id: 3 } as Level]);
        });
    });

    describe('updatePageLevels', () => {
        it('should correctly update the shownLevel attribute', () => {
            service['currentShownPage'] = 1;
            service['updatePageLevels']();
            expect(service['shownLevels']).toEqual(levelExpectedArray.slice(Constants.levelsPerPage, levelExpectedArray.length));
        });
    });
});
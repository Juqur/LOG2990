/* eslint-disable max-lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Constants } from '@common/constants';
import { GameConstants } from '@common/game-constants';
import { Level } from '@common/interfaces/level';
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
    const gameConstants = {
        initialTime: Constants.INIT_COUNTDOWN_TIME,
        timePenaltyHint: Constants.HINT_PENALTY,
        timeGainedDifference: Constants.COUNTDOWN_TIME_WIN,
    } as GameConstants;

    beforeEach(() => {
        communicationServiceMock = jasmine.createSpyObj('CommunicationService', [
            'getLevels',
            'deleteLevel',
            'getGameConstants',
            'setNewGameConstants',
            'resetGameConstants',
        ]);
        socketHandlerMock = jasmine.createSpyObj('SocketHandler', ['isSocketAlive', 'connect', 'send', 'on', 'removeListener']);
        communicationServiceMock.getLevels.and.returnValue(of(levelExpectedArray));
        communicationServiceMock.deleteLevel.and.returnValue(of(true));
        communicationServiceMock.getGameConstants.and.returnValue(of(gameConstants));
        communicationServiceMock.setNewGameConstants.and.returnValue(of(undefined));
        communicationServiceMock.resetGameConstants.and.returnValue(of(undefined));

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

    describe('setupSocket', () => {
        it('should connect to socket if not connected', () => {
            socketHandlerMock.isSocketAlive.and.returnValue(false);
            service.setupSocket();
            expect(socketHandlerMock.connect).toHaveBeenCalled();
        });
        it('should refresh the levels if event is received', () => {
            socketHandlerMock.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'refreshLevels') {
                    callback({} as never);
                }
            });
            const refreshSpy = spyOn(service, 'refreshLevels');
            service.setupSocket();
            expect(refreshSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('destroySocket', () => {
        it('should remove socket event listener', () => {
            service.destroySocket();
            expect(socketHandlerMock.removeListener).toHaveBeenCalled();
        });

    });

    describe('get initialTime', () => {
        it('should use gameConstants if defined', () => {
            service['gameConstants'] = gameConstants;
            expect(service.initialTime).toEqual(gameConstants.initialTime);
        });
    });

    describe('get timePenaltyHint', () => {
        it('should use gameConstants if defined', () => {
            service['gameConstants'] = gameConstants;
            expect(service.timePenaltyHint).toEqual(gameConstants.timePenaltyHint);
        });
    });

    describe('get timeGainedDifference', () => {
        it('should use gameConstants if defined', () => {
            service['gameConstants'] = gameConstants;
            expect(service.timeGainedDifference).toEqual(gameConstants.timeGainedDifference);
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

    describe('setNewGameConstants', () => {
        let inputElement: HTMLInputElement;
        let mockEvent: Event;

        beforeEach(() => {
            inputElement = document.createElement('input');
            inputElement.id = 'initial-time-input';
            inputElement.value = '10';
            mockEvent = {
                target: inputElement,
            } as unknown as Event;
            communicationServiceMock.setNewGameConstants.calls.reset();
            service['gameConstants'] = {
                initialTime: Constants.INIT_COUNTDOWN_TIME,
                timePenaltyHint: Constants.HINT_PENALTY,
                timeGainedDifference: Constants.COUNTDOWN_TIME_WIN,
            } as GameConstants;
            spyOn(window, 'alert');
        });

        it('should not call communicationService.setNewGameConstants if gameConstants is not defined', () => {
            service['gameConstants'] = null;
            service.setNewGameConstants(mockEvent);
            expect(communicationServiceMock.setNewGameConstants).not.toHaveBeenCalled();
        });

        it('should not call communicationService.setNewGameConstants if inputValue is higher than 2 minutes for initialTime', () => {
            (mockEvent.target as HTMLInputElement).value = JSON.stringify(Constants.MAX_GAME_TIME_LENGTH + 1);
            service.setNewGameConstants(mockEvent);
            expect(communicationServiceMock.setNewGameConstants).not.toHaveBeenCalled();
        });

        it('should call communicationService.setNewGameConstants if inputValue is lower than 2 minutes for initialTime', () => {
            service.setNewGameConstants(mockEvent);
            expect(communicationServiceMock.setNewGameConstants).toHaveBeenCalledTimes(1);
            expect(service['gameConstants']?.initialTime).toEqual(Number((mockEvent.target as HTMLInputElement).value));
        });

        it('should not call communicationService.setNewGameConstants if inputValue has not changed for timePenaltyHint', () => {
            (mockEvent.target as HTMLInputElement).value = '5';
            (mockEvent.target as HTMLInputElement).id = 'time-penalty-hint-input';
            service.setNewGameConstants(mockEvent);
            expect(communicationServiceMock.setNewGameConstants).not.toHaveBeenCalled();
        });

        it('should call communicationService.setNewGameConstants if inputValue has changed for timePenaltyHint', () => {
            (mockEvent.target as HTMLInputElement).id = 'time-penalty-hint-input';
            service.setNewGameConstants(mockEvent);
            expect(communicationServiceMock.setNewGameConstants).toHaveBeenCalledTimes(1);
            expect(service['gameConstants']?.timePenaltyHint).toEqual(Number((mockEvent.target as HTMLInputElement).value));
        });

        it('should not call communicationService.setNewGameConstants if inputValue has not changed for timeGainedDifference', () => {
            (mockEvent.target as HTMLInputElement).value = '5';
            (mockEvent.target as HTMLInputElement).id = 'time-gained-difference-input';
            service.setNewGameConstants(mockEvent);
            expect(communicationServiceMock.setNewGameConstants).not.toHaveBeenCalled();
        });

        it('should call communicationService.setNewGameConstants if inputValue has changed for timeGainedDifference', () => {
            (mockEvent.target as HTMLInputElement).id = 'time-gained-difference-input';
            service.setNewGameConstants(mockEvent);
            expect(communicationServiceMock.setNewGameConstants).toHaveBeenCalledTimes(1);
            expect(service['gameConstants']?.timeGainedDifference).toEqual(Number((mockEvent.target as HTMLInputElement).value));
        });
    });

    describe('resetGameConstants', () => {
        it('should set the gameConstants to its default values', () => {
            service.resetGameConstants();
            expect(service['gameConstants']).toEqual({
                initialTime: Constants.INIT_COUNTDOWN_TIME,
                timePenaltyHint: Constants.HINT_PENALTY,
                timeGainedDifference: Constants.COUNTDOWN_TIME_WIN,
            });
        });

        it('should call communicationService.resetGameConstants', () => {
            service.resetGameConstants();
            expect(communicationServiceMock.resetGameConstants).toHaveBeenCalledTimes(1);
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
        let removeCardSpy: jasmine.Spy;

        beforeEach(() => {
            removeCardSpy = spyOn(service, 'removeCard');
        });

        it('should call removeCard', () => {
            const levelId = 1;
            service.deleteLevel(levelId);
            expect(removeCardSpy).toHaveBeenCalledTimes(1);
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

    describe('deleteAllLevels', () => {
        let removeAllCardsSpy: jasmine.Spy;

        beforeEach(() => {
            removeAllCardsSpy = spyOn(service, 'removeAllCards');
        });

        it('should call removeAllCards', () => {
            service.deleteAllLevels();
            expect(removeAllCardsSpy).toHaveBeenCalledTimes(1);
        });

        it('should call connect if the socket is not alive', () => {
            socketHandlerMock.isSocketAlive.and.returnValue(false);
            service.deleteAllLevels();
            expect(socketHandlerMock.connect).toHaveBeenCalledTimes(1);
        });

        it('should call send', () => {
            service.deleteAllLevels();
            expect(socketHandlerMock.send).toHaveBeenCalledWith('game', 'onDeleteAllLevels');
        });
    });

    describe('removeCard', () => {
        it('should correctly remove the card', () => {
            const levelId = 1;
            service['levels'] = [{ id: 1 } as Level, { id: 2 } as Level, { id: 3 } as Level];
            service['removeCard'](levelId);
            expect(service['levels']).toEqual([{ id: 2 } as Level, { id: 3 } as Level]);
        });
    });

    describe('removeAllCards', () => {
        it('should correctly remove all cards', () => {
            service['levels'] = [{ id: 1 } as Level, { id: 2 } as Level, { id: 3 } as Level];
            service['removeAllCards']();
            expect(service['levels']).toEqual([]);
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

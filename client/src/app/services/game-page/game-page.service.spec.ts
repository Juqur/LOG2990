import { TestBed } from '@angular/core/testing';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { GamePageService } from './game-page.service';

describe('GamePageService', () => {
    let service: GamePageService;
    let socketHandler: jasmine.SpyObj<SocketHandler>;

    beforeEach(() => {
        socketHandler = jasmine.createSpyObj('SocketHandler', ['send']);
        TestBed.configureTestingModule({
            providers: [{ provide: SocketHandler, useValue: socketHandler }],
        });
        service = TestBed.inject(GamePageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return -1 if the number of differences found is equal to the number of differences', () => {
        service.setNumberOfDifference(1);
        service.setDifferenceFound(1);
        expect(service.validateResponse([1])).toEqual(Constants.minusOne);
    });
    it('should return 0 if a different is not found', () => {
        expect(service.validateResponse([Constants.minusOne])).toEqual(0);
    });
    it('should return 1 if a different is found', () => {
        service.setNumberOfDifference(2);
        expect(service.validateResponse([1])).toEqual(1);
    });

    it('should send a click to the server', () => {
        service.sendClick(1);
        expect(socketHandler.send).toHaveBeenCalledWith('game', 'onClick', { position: 1 });
    });

    it('should set the number of differences', () => {
        service.setDifferenceFound(1);
        expect(service['differencesFound']).toEqual(1);
    });
});

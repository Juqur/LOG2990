import { Constants } from '@common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './../../../app/services/image/image.service';
import { ImageController } from './image.controller';

describe('ImageController', () => {
    let controller: ImageController;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImageController],
            providers: [ImageService],
        }).compile();
        controller = module.get<ImageController>(ImageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    it('true should be equal to true', () => {
        expect(true).toEqual(true);
    });

    it('getSingleGameData should return the level corresponding to the correct id.', () => {
        const expectedLevel = {
            id: 5,
            name: 'Yuheng of Liyue Qixing',
            playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
            timeSolo: Constants.timeSolo,
            playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
            timeMulti: Constants.timeMulti,
            isEasy: true,
        };
        const result = controller.getSingleGameData('5');
        expect(result).toEqual(expectedLevel);
    });
});

import { levelModel } from '@app/model/schema/level.schema';
import { Score } from '@app/model/schema/score.schema';
import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

/**
 * This service is used communicate to the database.
 *
 * @author Louis Félix St-Amour
 * @class MongodbService
 */
@Injectable()
export class MongodbService {
    async saveLevel(): Promise<void> {
        // mocked test level
        mongoose.connect('mongodb+srv://admin:d5jrnGEteyCCNMcW@log2990.ic11qkn.mongodb.net/?');
        await levelModel.create({
            id: 1,
            name: 'Cocogoat',
            scoreSolo: [{ name: 'Player 1', time: 23 } as Score, { name: 'Player 2', time: 27 } as Score, { name: 'Player 3', time: 98 } as Score],
            scoreMulti: [{ name: 'Player x', time: 12 } as Score, { name: 'Player y', time: 15 } as Score, { name: 'Player z', time: 150 } as Score],
            isEasy: true,
            nbDifferences: 5,
        });
        mongoose.disconnect();
        // await level
        //     .save()
        //     .then((result) => {
        //         // eslint-disable-next-line no-console
        //         console.log('Level saved successfully:', result);
        //     })
        //     .catch((error) => {
        //         // eslint-disable-next-line no-console
        //         console.error('Error while saving Level:', error);
        //     });
    }
}

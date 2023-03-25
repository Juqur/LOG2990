import { Injectable } from '@nestjs/common';

/**
 * This service is used communicate to the database.
 *
 * @author Louis Félix St-Amour
 * @class MongodbService
 */
@Injectable()
export class MongodbService {
    // saveLevel(): void {
    //     // mocked test level
    //     const level = new levelModel({
    //         id: 1,
    //         name: 'Cocogoat',
    //         scoreSolo: [
    //             { name: 'Player 1', time: '23' },
    //             { name: 'Player 2', time: '27' },
    //             { name: 'Player 3', time: '98' },
    //         ],
    //         scoreMulti: [
    //             { name: 'Player x', time: '12' },
    //             { name: 'Player y', time: '15' },
    //             { name: 'Player z', time: '150' },
    //         ],
    //         isEasy: true,
    //         nbDifferences: 5,
    //     });
    //     // hopefully saves the Level object to the database
    //     level
    //         .save()
    //         .then((result) => {
    //             console.log('Level saved successfully:', result);
    //         })
    //         .catch((error) => {
    //             console.error('Error while saving Level:', error);
    //         });
    // }
}

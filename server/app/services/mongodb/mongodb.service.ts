import { levelModel } from '@app/model/schema/level.schema';
import { Injectable } from '@nestjs/common';
import { Level } from 'assets/data/level';
import mongoose from 'mongoose';

/**
 * This service is used communicate to the database.
 *
 * @author Louis Félix St-Amour
 * @class MongodbService
 */
@Injectable()
export class MongodbService {
    async createNewLevel(level: Level) {
        this.openConnection();
        await levelModel.create({
            id: level.id,
            name: level.name,
            playerSolo: level.playerMulti,
            timeSolo: level.timeMulti,
            playerMulti: level.playerMulti,
            timeMulti: level.timeMulti,
            isEasy: level.isEasy,
            nbDifferences: level.nbDifferences,
            canJoin: level.canJoin,
        });
        this.closeConnection();
    }

    /**
     * This method opens the connection to the mongoDB to allow inserting and manipulating the data inside.
     * The method only opens connection if we aren't connected.
     */
    private openConnection(): void {
        if (!mongoose.connection.readyState) {
            mongoose.connect('mongodb+srv://admin:d5jrnGEteyCCNMcW@log2990.ic11qkn.mongodb.net/?');
        }
    }

    /**
     * This method closes the connection to the mongoDB.
     */
    private closeConnection(): void {
        if (mongoose.connection.readyState) {
            mongoose.disconnect();
        }
    }
}

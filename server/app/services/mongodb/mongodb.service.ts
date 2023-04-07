import { levelModel } from '@app/model/schema/level.schema';
import { Injectable } from '@nestjs/common';
import { Level } from 'assets/data/level';
import mongoose from 'mongoose';

mongoose.set('strictQuery', false); // fixes a warning

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
     * This method returns the solo highscores of the specified level.
     *
     * @param id the id of the level.
     * @returns level.timesolo the solo highscores of the specified level.
     */
    async getTimeSoloArray(id: number): Promise<number[]> {
        this.openConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        const level = await levelModel.findOne({ id });
        this.closeConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        return level.timeSolo;
    }

    /**
     * This method returns the solo highscores names of the specified level.
     *
     * @param id the id of the level.
     * @returns the solo highscores names of the specified level.
     */
    async getPlayerSoloArray(id: number): Promise<string[]> {
        this.openConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        const level = await levelModel.findOne({ id });
        this.closeConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        return level.playerSolo;
    }

    /**
     * This method returns the multiplayer highscores of the specified level.
     *
     * @param id the id of the level.
     * @returns level.timesolo the multiplayer highscores of the specified level.
     */
    async getTimeMultiArray(id: number): Promise<number[]> {
        this.openConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        const level = await levelModel.findOne({ id });
        this.closeConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        return level.timeMulti;
    }

    /**
     * This method returns the multiplayer highscores names of the specified level.
     *
     * @param id the id of the level.
     * @returns the multiplayer highscores names of the specified level.
     */
    async getPlayerMultiArray(id: number): Promise<string[]> {
        this.openConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        const level = await levelModel.findOne({ id });
        this.closeConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        return level.playerMulti;
    }

    /**
     * This method opens the connection to the mongoDB to allow inserting and manipulating the data inside.
     * The method only opens connection if we aren't connected.
     */
    private async openConnection(): Promise<void> {
        try {
            if (!mongoose.connection.readyState) {
                await mongoose.connect('mongodb+srv://admin:d5jrnGEteyCCNMcW@log2990.ic11qkn.mongodb.net/?');
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * This method closes the connection to the mongoDB.
     */
    private async closeConnection(): Promise<void> {
        if (mongoose.connection.readyState) {
            await mongoose.disconnect();
        }
    }
}

import { GameHistory, gameHistoryModel } from '@app/model/schema/game-history.schema';
import { levelModel } from '@app/model/schema/level.schema';
import { Injectable } from '@nestjs/common';
import { Level } from 'assets/data/level';
import mongoose, { ConnectionStates } from 'mongoose';

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
    async getPlayerSoloArray(levelId: number): Promise<string[]> {
        this.openConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        const level = await levelModel.findOne({ levelId });
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
     * @param levelId the id of the level.
     * @returns the multiplayer highscores names of the specified level.
     */
    async getPlayerMultiArray(levelId: number): Promise<string[]> {
        this.openConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        const level = await levelModel.findOne({ levelId });
        this.closeConnection();
        await new Promise((f) => setTimeout(f, 1000)); // horrible
        return level.playerMulti;
    }

    /**
     * This method adds a GameHistory instance to the database.
     *
     * @param gameHistory The game history containing the pertinent information to create a GameHistory in the database.
     */
    async addGameHistory(gameHistory: GameHistory): Promise<void> {
        await this.openConnection();
        await gameHistoryModel.create({
            startDate: gameHistory.startDate,
            lengthGame: gameHistory.lengthGame,
            isClassic: gameHistory.isClassic,
            firstPlayerName: gameHistory.firstPlayerName,
            secondPlayerName: gameHistory.secondPlayerName,
            hasPlayerAbandoned: gameHistory.hasPlayerAbandoned,
        });
        await this.closeConnection();
    }

    /**
     * This method opens the connection to the mongoDB to allow inserting and manipulating the data inside.
     * The method only opens connection if we aren't connected.
     */
    private async openConnection(): Promise<void> {
        try {
            if (!(mongoose.connection.readyState === ConnectionStates.connected || mongoose.connection.readyState === ConnectionStates.connecting)) {
                await mongoose.connect('mongodb+srv://charlesdegrandpre:bcnWPxjUMghWxIZI@cluster0.civxl2l.mongodb.net/test');
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
        }
    }

    /**
     * This method closes the connection to the mongoDB.
     */
    private async closeConnection(): Promise<void> {
        try {
            if (mongoose.connection.readyState === ConnectionStates.connected || mongoose.connection.readyState === ConnectionStates.connecting) {
                await mongoose.disconnect();
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
        }
    }
}

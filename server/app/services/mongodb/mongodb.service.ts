import { Level, LevelDocument } from '@app/model/schema/level.schema';
import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Level as LevelDto } from 'assets/data/level';
import mongoose, { Model } from 'mongoose';

mongoose.set('strictQuery', false); // fixes a warning

/**
 * This service is used communicate to the database.
 *
 * @author Louis Félix St-Amour
 * @class MongodbService
 */
@Injectable()
export class MongodbService {
    constructor(@InjectModel(Level.name) public levelModel: Model<LevelDocument>) {}

    /**
     * This method creates a new level object inside the database.
     *
     * @param level the level DTO with the relevant information to create a new level in the database.
     */
    async createNewLevel(level: LevelDto) {
        await this.levelModel.create({
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
    }

    /**
     * The method removes from the database the level with the associated id.
     *
     * @param levelId the id of the level we wish to delete.
     */
    async deleteLevel(levelId: number) {
        await this.levelModel.deleteOne({ id: levelId });
    }

    /**
     * This method returns all levels from the database. It should be used ONLY
     * when STRICTLY necessary as it is a resource demanding function.
     *
     * There is a possibility we have no elements in the database and so this query
     * can return null.
     *
     * @returns returns all the levels in the db
     */
    async getAllLevels(): Promise<Level[] | null> {
        return (await this.levelModel.find({})) as Level[];
    }

    /**
     * This method returns a level by it's given id.
     *
     * There is a possibility we have no elements in the database and so this query
     * can return null or simply that the provided id does not match any of the ids
     * inside the database.
     *
     * @param levelId the id of the level we want to find.
     * @returns the level associated with the given id.
     */
    async getLevelById(levelId: number): Promise<Level | null> {
        return (await this.levelModel.findOne({ id: levelId })) as Level;
    }

    /**
     * This method returns the id of the last inserted level.
     *
     * @returns the id of the last inserted level
     */
    async getLastLevelId(): Promise<number> {
        return (await this.levelModel.find().limit(1).sort({ $natural: -1 }))[0].id as number;
    }

    /**
     * This method returns the solo highscores of the specified level.
     *
     * @param id the id of the level.
     * @returns level.timesolo the solo highscores of the specified level.
     */
    async getTimeSoloArray(id: number): Promise<number[]> {
        const level = await this.levelModel.findOne({ id });

        return level.timeSolo;
    }

    /**
     * This method returns the solo highscores names of the specified level.
     *
     * @param id the id of the level.
     * @returns the solo highscores names of the specified level.
     */
    async getPlayerSoloArray(id: number): Promise<string[]> {
        const level = await this.levelModel.findOne({ id });
        return level.playerSolo;
    }

    /**
     * This method returns the multiplayer highscores of the specified level.
     *
     * @param id the id of the level.
     * @returns level.timesolo the multiplayer highscores of the specified level.
     */
    async getTimeMultiArray(id: number): Promise<number[]> {
        const level = await this.levelModel.findOne({ id });
        return level.timeMulti;
    }

    /**
     * This method returns the multiplayer highscores names of the specified level.
     *
     * @param id the id of the level.
     * @returns the multiplayer highscores names of the specified level.
     */
    async getPlayerMultiArray(id: number): Promise<string[]> {
        const level = await this.levelModel.findOne({ id });
        return level.playerMulti;
    }

    /**
     * This method returns the multiplayer highscores names of the specified level.
     *
     * @param id the id of the level.
     * @returns the multiplayer highscores names of the specified level.
     */
    // eslint-disable-next-line max-params
    async updateHighscore(playerNames: string[], playerTimes: number[], multiplayer: boolean, id: number): Promise<void> {
        const level = await this.levelModel.findOne({ id });
        if (multiplayer) {
            level.playerMulti = playerNames;
            level.timeMulti = playerTimes;
        } else {
            level.playerSolo = playerNames;
            level.timeSolo = playerTimes;
        }
        level.save();
    }

    /**
     * This method returns all 4 levels to display on a given page. The index start at one, so if
     * you wanted to get the levels for the first page you could give as parameter 1 and not 0.
     *
     * This method can return null in the case where the given page number in parameter is invalid,
     * in other words, if the page number is lower than 0 or that it is greater than the amount of
     * pages we can construct with our level count.
     *
     * @param pageNumber the page number we want to get the levels for.
     */
    async getLevelsInPage(pageNumber: number): Promise<Level[] | null> {
        if (pageNumber <= 0) {
            return new Promise(null);
        }
        return (await this.levelModel
            .find({})
            .skip((pageNumber - 1) * Constants.levelsPerPage)
            .limit(Constants.levelsPerPage)) as Level[];
    }
}

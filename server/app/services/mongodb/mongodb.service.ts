import { GameHistory, GameHistoryDocument } from '@app/model/schema/game-history.schema';
import { Level, LevelDocument } from '@app/model/schema/level.schema';
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
    constructor(
        @InjectModel(Level.name) public levelModel: Model<LevelDocument>,
        @InjectModel(GameHistory.name) public gameHistoryModel: Model<GameHistoryDocument>,
    ) {}

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
     * This method returns the solo highscores names of thSe specified level.
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
     * @param levelId the id of the level.
     * @returns the multiplayer highscores names of the specified level.
     */
    async getPlayerMultiArray(id: number): Promise<string[]> {
        const level = await this.levelModel.findOne({ id });
        return level.playerMulti;
    }

    /**
     * This method adds a GameHistory instance to the database.
     *
     * @param gameHistory The game history containing the pertinent information to create a GameHistory in the database.
     */
    async addGameHistory(gameHistory: GameHistory): Promise<void> {
        await this.gameHistoryModel.create({
            startDate: gameHistory.startDate,
            lengthGame: gameHistory.lengthGame,
            isClassic: gameHistory.isClassic,
            firstPlayerName: gameHistory.firstPlayerName,
            secondPlayerName: gameHistory.secondPlayerName,
            hasPlayerAbandoned: gameHistory.hasPlayerAbandoned,
        });
    }

    /*
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
}

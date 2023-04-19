import { GameConstants, GameConstantsDocument } from '@app/model/schema/game-constants.schema';
import { GameHistory, GameHistoryDocument } from '@app/model/schema/game-history.schema';
import { Level, LevelDocument } from '@app/model/schema/level.schema';
import { Message } from '@app/model/schema/message.schema';
import { GameState } from '@app/services/game/game.service';
import { Constants } from '@common/constants';
import { GameConstants as GameConstantsDto } from '@common/game-constants';
import { GameHistory as GameHistoryDataObject } from '@common/game-history';
import { Level as LevelDataObject } from '@common/interfaces/level';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

mongoose.set('strictQuery', false);

/**
 * This service is used communicate to the database.
 *
 * @author Louis Félix St-Amour & Charles Degrandpré
 * @class MongodbService
 */
@Injectable()
export class MongodbService {
    constructor(
        @InjectModel(Level.name) public levelModel: Model<LevelDocument>,
        @InjectModel(GameHistory.name) public gameHistoryModel: Model<GameHistoryDocument>,
        @InjectModel(GameConstants.name) public gameConstantsModel: Model<GameConstantsDocument>,
    ) {
        this.gameConstantsModel
            .find({})
            .exec()
            .then(async (result) => {
                if (!result[0]) {
                    await this.gameConstantsModel.create({
                        initialTime: Constants.INIT_COUNTDOWN_TIME,
                        timePenaltyHint: Constants.HINT_PENALTY,
                        timeGainedDifference: Constants.COUNTDOWN_TIME_WIN,
                    } as GameConstants);
                }
            });
    }

    /**
     * This method creates a new level object inside the database.
     *
     * @param level The level DTO with the relevant information to create a new level in the database.
     */
    async createNewLevel(level: LevelDataObject): Promise<void> {
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
     * @param levelId The id of the level we wish to delete.
     */
    async deleteLevel(levelId: number): Promise<void> {
        await this.levelModel.deleteOne({ id: levelId }).exec();
    }

    /**
     * This method returns all levels from the database. It should be used ONLY
     * when STRICTLY necessary as it is a resource demanding function.
     *
     * There is a possibility we have no elements in the database and so this query
     * can return null.
     *
     * @returns All the levels in the db.
     */
    async getAllLevels(): Promise<LevelDataObject[] | null> {
        return (await this.levelModel.find({}).exec()) as LevelDataObject[] | null;
    }

    /**
     * This method returns a level by it's given id.
     *
     * There is a possibility we have no elements in the database and so this query
     * can return null or simply that the provided id does not match any of the ids
     * inside the database.
     *
     * @param levelId The id of the level we want to find.
     * @returns The level associated with the given id.
     */
    async getLevelById(levelId: number): Promise<LevelDataObject | null> {
        return (await this.levelModel.findOne({ id: levelId }).exec()) as LevelDataObject | null;
    }

    /**
     * This method returns the id of the last inserted level.
     *
     * @returns The id of the last inserted level.
     */
    async getLastLevelId(): Promise<number> {
        try {
            // Verifies that there is at least one level in the database.
            const test = await this.levelModel.findOne({});
            return test ? ((await this.levelModel.find().limit(1).sort({ $natural: -1 }).exec())[0].id as number) : 0;
        } catch (error) {
            this.handleErrors(error);
        }
    }

    /**
     * This method returns the solo highscores times of the specified level.
     *
     * @param id The id of the level.
     * @returns The solo highscores times of the specified level.
     */
    async getTimeSoloArray(levelId: number): Promise<number[] | null> {
        return (await this.levelModel.findOne({ id: levelId }).exec()).timeSolo as number[] | null;
    }

    /**
     * This method returns the solo highscores names of the specified level.
     *
     * @param id The id of the level.
     * @returns The solo highscores names of the specified level.
     */
    async getPlayerSoloArray(levelId: number): Promise<string[] | null> {
        return (await this.levelModel.findOne({ id: levelId }).exec()).playerSolo as string[] | null;
    }

    /**
     * This method returns the multiplayer highscores times of the specified level.
     *
     * @param id The id of the level.
     * @returns level.timesolo The multiplayer highscores times of the specified level.
     */
    async getTimeMultiArray(levelId: number): Promise<number[] | null> {
        return (await this.levelModel.findOne({ id: levelId }).exec()).timeMulti as number[] | null;
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

    /**
     * This method query's the server for all game histories stored from inside the database.
     *
     * @returns An array containing all game histories.
     */
    async getGameHistories(): Promise<GameHistoryDataObject[]> {
        return (await this.gameHistoryModel.find({}).exec()) as GameHistoryDataObject[] | null;
    }

    /**
     * This method removes all games histories from the database.
     */
    async deleteAllGameHistories(): Promise<void> {
        await this.gameHistoryModel.deleteMany({}).exec();
    }

    /*
     * This method returns the multiplayer highscores names of the specified level.
     *
     * @param id The id of the level.
     * @returns The multiplayer highscores names of the specified level.
     */
    async getPlayerMultiArray(levelId: number): Promise<string[] | null> {
        return (await this.levelModel.findOne({ id: levelId }).exec()).playerMulti as string[] | null;
    }

    /**
     * This method is in charge of updating the new highscores of a game. It takes the time
     * of a game that has just completed as well as the game state associated with this game
     * and verifies if the time is a new high core, if it is it updates the database accordingly.
     *
     * @param endTime The duration of the game in seconds.
     * @param gameState The game state associated with the game that just finished.
     */
    async updateHighscore(endTime: number, gameState: GameState): Promise<number> {
        if (await this.getLevelById(gameState.levelId)) {
            let names: string[] = [];
            let times: number[] = [];

            if (gameState.otherSocketId) {
                names = await this.getPlayerMultiArray(gameState.levelId);
                times = await this.getTimeMultiArray(gameState.levelId);
            } else {
                names = await this.getPlayerSoloArray(gameState.levelId);
                times = await this.getTimeSoloArray(gameState.levelId);
            }

            if (endTime < times[2]) {
                names[2] = gameState.playerName;
                times[2] = endTime;
                for (let i = names.length - 1; i > 0; i--) {
                    if (times[i] < times[i - 1]) {
                        times[i] = times[i - 1];
                        names[i] = names[i - 1];

                        times[i - 1] = endTime;
                        names[i - 1] = gameState.playerName;
                    }
                }
                if (gameState.otherSocketId) {
                    await this.levelModel.findOneAndUpdate({ id: gameState.levelId }, { playerMulti: names, timeMulti: times }).exec();
                } else {
                    await this.levelModel.findOneAndUpdate({ id: gameState.levelId }, { playerSolo: names, timeSolo: times }).exec();
                }
                return names.indexOf(gameState.playerName) + 1;
            }
        }
        return null;
    }

    /**
     * This method returns all 4 levels to display on a given page. The index start at one, so if
     * you wanted to get the levels for the first page you could give as parameter 1 and not 0.
     *
     * This method can return null in the case where the given page number in parameter is invalid,
     * in other words, if the page number is lower than 0 or that it is greater than the amount of
     * pages we can construct with our level count.
     *
     * @param pageNumber The page number we want to get the levels for.
     */
    async getLevelsInPage(pageNumber: number): Promise<Level[] | null> {
        if (pageNumber <= 0) {
            return Promise.resolve(null);
        }
        return (await this.levelModel
            .find({})
            .skip((pageNumber - 1) * Constants.levelsPerPage)
            .limit(Constants.levelsPerPage)
            .exec()) as Level[];
    }

    /**
     * This method is used to get the game constants from the database. It returns an object
     * containing all three constants.
     *
     * @returns The game constants.
     */
    async getGameConstants(): Promise<GameConstantsDto> {
        const result = await this.gameConstantsModel.find({}).exec();
        return result[0] as GameConstantsDto;
    }

    /**
     * This method is used to reset the base constants to their original values.
     * These values are contained inside the Constants file in common.
     */
    async resetGameConstants(): Promise<void> {
        await this.setNewGameConstants({
            initialTime: Constants.INIT_COUNTDOWN_TIME,
            timePenaltyHint: Constants.HINT_PENALTY,
            timeGainedDifference: Constants.COUNTDOWN_TIME_WIN,
        } as GameConstantsDto);
    }

    /**
     * This method is used to set the new game constants stored inside the database.
     *
     * @param gameConstants The new game constants.
     */
    async setNewGameConstants(gameConstants: GameConstantsDto): Promise<void> {
        await this.gameConstantsModel
            .findOneAndUpdate({}, {
                initialTime: gameConstants.initialTime,
                timePenaltyHint: gameConstants.timePenaltyHint,
                timeGainedDifference: gameConstants.timeGainedDifference,
            } as GameConstants)
            .exec();
    }

    /**
     * Internal method that handles errors when fetching the previous id in the database.
     *
     * @param err The error to be handled
     * @returns The message that the level was not successfully uploaded
     */
    private handleErrors(err: Error): Message {
        const message: Message = new Message();
        message.title = 'error';
        message.body = 'Échec du téléchargement du jeu. Veuillez réessayer plus tard. \nErreur: ' + err.message;
        return message;
    }
}

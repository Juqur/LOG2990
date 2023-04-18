import { Message } from '@app/model/schema/message.schema';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { Constants } from '@common/constants';
import { Level } from '@common/interfaces/level';
import { Injectable } from '@nestjs/common';
import { LevelData } from 'assets/data/level';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import { mkdir } from 'fs/promises';

/**
 * This service is used to get the amount of differences left between the two images.
 * Only used when the game is running.
 *
 * @author Louis-Félix St-Amour et Pierre Tran
 * @class ImageService
 */
@Injectable()
export class ImageService {
    readonly pathDifference: string = '../server/assets/images/differences/';
    readonly pathModified: string = '../server/assets/images/modified/';
    readonly pathOriginal: string = '../server/assets/images/original/';
    readonly pathData: string = '../server/assets/data/';

    constructor(private mongodbService: MongodbService) {}

    /**
     * This method makes a call to the mongo db service in order to obtain all levels.
     *
     * @returns The array containing all current levels inside the database.
     */
    async getLevels(): Promise<Level[]> {
        return await this.mongodbService.getAllLevels();
    }

    /**
     * Gets the number of differences between the two images.
     *
     * @param fileName The name of the file that has the differences.
     * @returns The number of differences between the two images.
     */
    async differencesCount(fileName: string): Promise<number> {
        try {
            const promises = await fsp.readFile(this.pathDifference + fileName + '.json', 'utf8');
            const differences = (JSON.parse(promises.toString()) as number[][]).length;
            return differences;
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Gets the array of differences from the json file.
     *
     * @param fileName The name of the file that has the differences.
     * @returns The array of differences.
     */
    async getAllDifferences(fileName: string): Promise<number[][]> {
        try {
            const promises = await fsp.readFile(this.pathDifference + fileName + '.json', 'utf8');
            return JSON.parse(promises) as number[][];
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Iterates through the 2 dimension array to compare each pixel with the position
     * of the clicked pixel and returns the index of the array that contains the clicked pixel.
     *
     * @param allDifferences The array of differences.
     * @param foundDifferences The indexes of the differences array that have already been found.
     * @param pixelClicked The position of the pixel clicked
     * @returns The array of pixels that are different.
     */
    getIndex(allDifferences: number[][], foundDifferences: number[], pixelClicked: number): number {
        for (const difference of allDifferences) {
            const index = allDifferences.indexOf(difference);
            if (difference.includes(pixelClicked) && !foundDifferences.includes(index)) {
                foundDifferences.push(index);
                return index;
            }
        }
    }

    /**
     * Finds the difference between the original image and the modified image.
     * If difference is already found, returns an empty array.
     *
     * @param fileName The name of the file that has the differences
     * @param foundDifferences The indexes of the differences array that have already been found.
     * @param position The position of the pixel clicked
     * @returns The array of pixels that are different if there is a difference
     */
    async findDifference(
        fileName: string,
        foundDifferences: number[],
        position: number,
    ): Promise<{ differencePixels: number[]; totalDifferences: number }> {
        const allDifferences = await this.getAllDifferences(fileName);
        const index = this.getIndex(allDifferences, foundDifferences, position);
        const foundDifferenceArray = allDifferences[index];
        return foundDifferenceArray
            ? { differencePixels: foundDifferenceArray, totalDifferences: allDifferences.length }
            : { differencePixels: [], totalDifferences: allDifferences.length };
    }

    /**
     * Writes the level data in the json file.
     *
     * @param newLevel The level to be uploaded
     * @returns The message that the level was successfully uploaded
     */
    async writeLevelData(newLevel: unknown): Promise<Message> {
        try {
            const newId = (await this.mongodbService.getLastLevelId()) + 1;
            const levelData = newLevel as LevelData;
            const level: Level = {
                id: newId,
                name: levelData.name,
                playerSolo: Constants.defaultPlayerSolo,
                timeSolo: Constants.defaultTimeSolo,
                playerMulti: Constants.defaultPlayerMulti,
                timeMulti: Constants.defaultTimeMulti,
                isEasy: levelData.isEasy === 'true',
                nbDifferences: levelData.nbDifferences,
            } as Level;
            await this.mongodbService.createNewLevel(level);

            await mkdir(this.pathDifference, { recursive: true });
            fs.writeFile(this.pathDifference + newId + '.json', levelData.clusters.toString(), (error) => {
                if (error) throw error;
            });

            await mkdir(this.pathOriginal, { recursive: true });
            fs.rename(levelData.imageOriginal.path, this.pathOriginal + newId + '.bmp', (error) => {
                if (error) throw error;
            });

            await mkdir(this.pathModified, { recursive: true });
            fs.rename(levelData.imageDiff.path, this.pathModified + newId + '.bmp', (error) => {
                if (error) throw error;
            });

            return this.confirmUpload(level);
        } catch (error) {
            return this.handleErrors(error);
        }
    }

    /**
     * Deletes the level in the json file.
     *
     * @param id The id of the level to be deleted.
     * @returns The confirmation of the deletion.
     */
    async deleteLevelData(id: number): Promise<boolean> {
        try {
            const level = await this.mongodbService.getLevelById(id);
            if (!level) {
                return false;
            }
            await this.mongodbService.deleteLevel(id);

            fs.unlink(this.pathDifference + id + '.json', (error) => {
                if (error) throw error;
            });
            fs.unlink(this.pathOriginal + id + '.bmp', (error) => {
                if (error) throw error;
            });
            fs.unlink(this.pathModified + id + '.bmp', (error) => {
                if (error) throw error;
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Internal method that generates a message when the level is successfully uploaded.
     *
     * @returns The message that the level was successfully uploaded
     */
    private confirmUpload(level: Level): Message {
        const message: Message = new Message();
        message.title = 'success';
        message.body = 'Le jeu a été téléchargé avec succès!';
        message.level = level;
        return message;
    }

    /**
     * Internal method that handles errors when writing the level data in the json file.
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

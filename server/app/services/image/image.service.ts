import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { promises as fsp } from 'fs';
import * as fs from 'fs';
import { Level, LevelData } from 'assets/data/level';
import { Message } from '@app/model/schema/message.schema';

@Injectable()
export class ImageService {
    readonly pathDifference: string = '../server/assets/images/differences/';
    readonly pathModified: string = '../server/assets/images/modifiees/';
    readonly pathOriginal: string = '../server/assets/images/originals/';
    readonly pathData: string = '../server/assets/data/';

    foundDifferences: number[] = [];

    async getLevels(): Promise<Level[]> {
        const promises = await fsp.readFile(this.pathData + 'levels.json', 'utf8');
        return JSON.parse(promises.toString()) as Level[];
    }

    /**
     * Gets the number of differences between the two images
     *
     * @param fileName The name of the file that has the differences
     * @returns the number of differences between the two images
     */
    async differencesCount(fileName: string): Promise<number> {
        const promises = await fsp.readFile(this.pathDifference + fileName + '.json', 'utf8');
        return (JSON.parse(promises.toString()) as number[][]).length;
    }

    /**
     * Finds the difference between the original image and the modified image
     * Also checks if the difference was already found
     *
     * @param fileName The name of the file that has the differences
     * @param position The position of the pixel clicked
     * @returns the array of pixels that are different if there is a difference
     */
    async findDifference(fileName: string, position: number): Promise<number[]> {
        const promises = await fsp.readFile(this.pathDifference + fileName + '.json', 'utf8');
        const allDifferences = JSON.parse(promises.toString()) as number[][];
        const foundDifferenceArray = allDifferences.find((differenceRow, index) => {
            if (differenceRow.indexOf(position) !== Constants.minusOne) {
                if (this.foundDifferences.find((difference) => difference === index) !== undefined) {
                    return false;
                } else {
                    this.foundDifferences.push(index);
                    return true;
                }
            }
            return false;
        });

        // Iterates through the 2 dimension array to compare each pixel with the position
        // of the clicked pixel and returns the array of pixels that are different
        return foundDifferenceArray;
    }

    async writeLevelData(newLevel: unknown): Promise<Message> {
        const promises = await fsp.readFile(this.pathData + 'levels.json', 'utf8');
        const allDifferences = JSON.parse(promises.toString()) as Level[];
        const newId = allDifferences.length + 1;
        const levelData = newLevel as LevelData;
        const level: Level = {
            id: newId,
            name: levelData.name,
            playerSolo: ['Bot1', 'Bot2', 'Bot3'],
            timeSolo: Constants.timeSolo,
            playerMulti: ['Bot1', 'Bot2', 'Bot3'],
            timeMulti: Constants.timeMulti,
            isEasy: levelData.isEasy === 'true' ? true : false,
        };
        allDifferences.push(level);
        fs.writeFile(this.pathDifference + newId + '.json', JSON.stringify(levelData.clusters), (err) => {
            if (err) this.handleErrors(err);
        });
        fs.rename(levelData.imageOriginal.path, this.pathOriginal + newId + '.bmp', (err) => {
            if (err) this.handleErrors(err);
        });
        fs.rename(levelData.imageDiff.path, this.pathModified + newId + '.bmp', (err) => {
            if (err) this.handleErrors(err);
        });
        await fsp.writeFile(this.pathData + 'levels.json', JSON.stringify(allDifferences));
        const message: Message = new Message();
        message.body = 'Le jeu a été téléchargé avec succès!';
        message.title = 'success';
        return message;
    }

    private handleErrors(err: Error): Message {
        const message: Message = new Message();
        message.body = 'Echec du téléchargement du jeu. Veuillez réessayer plus tard. \nErreur:' + err.message;
        message.title = 'error';
        return message;
    }
}

import { Message } from '@app/model/schema/message.schema';
import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { Level, LevelData } from 'assets/data/level';
import * as fs from 'fs';
import { promises as fsp } from 'fs';

@Injectable()
export class ImageService {
    readonly pathDifference: string = '../server/assets/images/differences/';
    readonly pathModified: string = '../server/assets/images/modifiees/';
    readonly pathOriginal: string = '../server/assets/images/originals/';
    readonly pathData: string = '../server/assets/data/';

    // foundDifferences: number[] = [];

    async getLevels(): Promise<Level[]> {
        const promises = await fsp.readFile(this.pathData + 'levels.json', 'utf8');
        return JSON.parse(promises.toString()) as Level[];
    }

    async getLevel(id: number): Promise<Level> {
        const promises = await fsp.readFile(this.pathData + 'levels.json', 'utf8');
        const allLevels = JSON.parse(promises.toString()) as Level[];
        return allLevels.find((level) => level.id === id);
    }
    /**
     * Gets the number of differences between the two images
     *
     * @param fileName The name of the file that has the differences
     * @returns the number of differences between the two images
     */
    // async differencesCount(fileName: string): Promise<number> {
    //     const filePath = path.resolve(this.pathDifference + fileName + '.json');
    //     console.log(filePath);
    //     const promises = await fsp.readFile(filePath, 'utf8');
    //     return (JSON.parse(promises.toString()) as number[][]).length;
    // }

    async differencesCount(fileName: string): Promise<number> {
        const filePath = this.pathDifference + fileName + '.json';
        const promises = await fsp.readFile(filePath, 'utf8');
        const differences = (JSON.parse(promises.toString()) as number[][]).length;
        return differences;
    }

    /**
     * Gets the array of differences from the json file
     *
     * @param fileName The name of the file that has the differences
     */
    async getArray(fileName: string): Promise<number[][]> {
        const promises = await fsp.readFile(this.pathDifference + fileName + '.json', 'utf8');
        return JSON.parse(promises) as number[][];
    }

    /**
     * Iterates through the 2 dimension array to compare each pixel with the position
     * of the clicked pixel and returns the array of pixels that are different
     *
     * @param allDifferences
     * @param position
     * @returns
     */
    returnIndex(allDifferences: number[][], foundDifferences: number[], pixelClicked: number): number {
        for (const difference of allDifferences) {
            const index = allDifferences.indexOf(difference);
            if (difference.includes(pixelClicked) && !foundDifferences.includes(index)) {
                foundDifferences.push(index);
                return index;
            }
        }
    }

    /**
     * Finds the difference between the original image and the modified image
     * Also checks if the difference was already found
     *
     * @param fileName The name of the file that has the differences
     * @param position The position of the pixel clicked
     * @returns the array of pixels that are different if there is a difference
     */
    async findDifference(fileName: string, foundDifferences: number[], position: number): Promise<number[]> {
        const allDifferences = await this.getArray(fileName);
        let index = this.returnIndex(allDifferences, foundDifferences, position);
        index = index === undefined ? Constants.minusOne : index;
        const foundDifferenceArray = allDifferences[index];
        if (foundDifferenceArray !== undefined) {
            return foundDifferenceArray;
        }

        if (foundDifferences.length === allDifferences.length) {
            return [Constants.minusOne];
        }

        return [];
    }

    async writeLevelData(newLevel: unknown): Promise<Message> {
        const promises = await fsp.readFile(this.pathData + 'levels.json', 'utf8');
        const allDifferences = JSON.parse(promises.toString()) as Level[];
        const newId = allDifferences.length + 1;
        const levelData = newLevel as LevelData;
        const nbDifferencesNumber = typeof levelData.nbDifferences === 'string' ? parseInt(levelData.nbDifferences, 10) : levelData.nbDifferences;
        const level: Level = {
            id: newId,
            name: levelData.name,
            playerSolo: ['Bot1', 'Bot2', 'Bot3'],
            timeSolo: Constants.timeSolo,
            playerMulti: ['Bot1', 'Bot2', 'Bot3'],
            timeMulti: Constants.timeMulti,
            isEasy: levelData.isEasy === 'true' ? true : false,
            nbDifferences: nbDifferencesNumber,
        };
        allDifferences.push(level);
        fs.writeFile(this.pathDifference + newId + '.json', levelData.clusters.toString(), (err) => {
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
        message.body = 'Échec du téléchargement du jeu. Veuillez réessayer plus tard. \nErreur:' + err.message;
        message.title = 'error';
        return message;
    }
}

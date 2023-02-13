import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { promises as fsp } from 'fs';
import * as fs from 'fs';
import { levels } from 'assets/data/level';
@Injectable()
export class ImageService {
    readonly pathDifference: string = '../server/assets/images/differences/';
    readonly pathData: string = '../server/assets/data/';

    foundDifferences: number[] = [];

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
        // const foundDifferences: number[] = [];
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

    writeLevelData(level: unknown) {
        const id = levels.length + 1;
        console.log(id);
        return level;
    }

}

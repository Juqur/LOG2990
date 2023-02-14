import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class ImageService {
    readonly pathDifference: string = '../server/assets/images/differences/';
    foundDifferences: number[] = [];

    /**
     * Gets the array of differences from the json file
     *
     * @param fileName The name of the file that has the differences
     * @returns the array of differences
     */
    async getArray(fileName: string): Promise<number[][]> {
        const promises = await fs.readFile(this.pathDifference + fileName + '.json', 'utf8');
        return JSON.parse(promises.toString()) as number[][];
    }

    /**
     * Iterates through the 2 dimension array to compare each pixel with the position
     * of the clicked pixel and returns the array of pixels that are different
     *
     * @param allDifferences
     * @param position
     * @returns the array of pixels that are different if there is a difference
     */
    returnArray(allDifferences: number[][], position: number): number[] {
        return allDifferences.find((differenceRow, index) => {
            if (differenceRow.indexOf(position) !== Constants.minusOne) {
                if (this.foundDifferences.find((difference) => difference === index) !== undefined) {
                    return false;
                }
                this.foundDifferences.push(index);
                return true;
            }
            return false;
        });
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
        const allDifferences = await this.getArray(fileName);
        const foundDifferenceArray = this.returnArray(allDifferences, position);
        if (foundDifferenceArray === undefined && this.foundDifferences.length === allDifferences.length) {
            return [Constants.minusOne];
        }
        return foundDifferenceArray ? foundDifferenceArray : [];
    }
}

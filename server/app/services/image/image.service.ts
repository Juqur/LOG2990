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
     * @returns
     */
    returnIndex(allDifferences: number[][], pixelClicked: number): number {
        for (const difference of allDifferences) {
            const index = allDifferences.indexOf(difference);
            if (difference.includes(pixelClicked) && !this.foundDifferences.includes(index)) {
                this.foundDifferences.push(index);
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
        let index = this.returnIndex(allDifferences, position);
        index = index === undefined ? Constants.minusOne : index;
        const foundDifferenceArray = allDifferences[index];
        if (foundDifferenceArray !== undefined) {
            return foundDifferenceArray;
        }

        if (this.foundDifferences.length === allDifferences.length) {
            return [Constants.minusOne];
        }

        return [];
    }
}

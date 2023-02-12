import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class ImageService {
    readonly path: string = '../server/assets/data/';
    readonly pathDifference: string = '../server/assets/differences/';

    foundDifferences: number[] = [];

    /**
     * Gets the card data from the json files
     *
     * @returns the array of card data
     */
    async getCardData(): Promise<unknown[]> {
        const files = await fs.readdir(this.path);
        const jsonFiles = files.filter((file) => file.endsWith('.json'));

        const promises = jsonFiles.map(async (file) => {
            const fileContents = await fs.readFile(this.path + file, 'utf8');
            const data = JSON.parse(fileContents);
            data.imageOriginal = await fs.readFile('assets/Images/' + data.name + '/og.bmp');
            data.imageDiff = await fs.readFile('assets/Images/' + data.name + '/diff.bmp');
            return data;
        });
        return Promise.all(promises);
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
        const promises = await fs.readFile(this.pathDifference + fileName + '.json', 'utf8');
        const allDifferences = JSON.parse(promises.toString()) as number[][];
        // const foundDifferences: number[] = [];

        const foundDifferenceArray = allDifferences.find((differenceRow, index) => {
            if (differenceRow.indexOf(position) !== Constants.minusOne) {
                if (this.foundDifferences.find((difference) => difference === index) !== undefined) {
                    return false;
                } else {
                    this.foundDifferences.push(index);
                    console.log(this.foundDifferences);
                    return true;
                }
            }
            return false;
        });

        // Iterates through the 2 dimension array to compare each pixel with the position
        // of the clicked pixel and returns the array of pixels that are different
        return foundDifferenceArray;
    }
}

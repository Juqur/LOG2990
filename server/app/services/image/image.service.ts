import { Constants } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class ImageService {
    readonly path: string = '../server/assets/data/';
    readonly pathDifference: string = '../server/assets/differences/';

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

    async findDifference(fileName: string, position: number): Promise<number[]> {
        const promises = await fs.readFile(this.pathDifference + fileName + '.json', 'utf8');
        const allDifferences = JSON.parse(promises.toString()) as number[][];

        // Iterates through the 2 dimension array to compare each pixel with the position
        // of the clicked pixel and returns the array of pixels that are different
        return allDifferences.find((differenceRow) => differenceRow.indexOf(position) !== Constants.minusOne) || [];
    }
}

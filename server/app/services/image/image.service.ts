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
            return JSON.parse(fileContents);
        });
        return Promise.all(promises);
    }

    async findDifference(name: string, position: number): Promise<number[]> {
        let allDifferences: number[][] = [];
        const promises = await fs.readFile(this.pathDifference + name + '.json', 'utf8');
        allDifferences = JSON.parse(promises.toString()) as number[][];

        // const differenceIndex = allDifferences.indexOf(position); // a essayer, trouver une manière de simplifier le code
        // Iterates trough the 2 dimension array to compare each pixel with the position of the clicked pixel
        let differenceIndex = 0;
        allDifferences.forEach((difference) => {
            differenceIndex = 0;
            difference.forEach((pixel) => {
                if (pixel === position) {
                    return allDifferences[differenceIndex];
                }
                differenceIndex++;
            });
        });

        return [];
    }
}

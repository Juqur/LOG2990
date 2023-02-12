import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class ImageService {
    readonly path: string = '../server/assets/Data/';
    readonly pathDifference: string = '../server/assets/Difference/';

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

    async getDifference(name: string, diffID: number): Promise<number[]> {
        let allDifferences: number[][] = [];
        const promises = await fs.readFile(this.pathDifference + name);
        allDifferences = JSON.parse(promises.toString()) as number[][];

        return allDifferences[diffID];
    }
}

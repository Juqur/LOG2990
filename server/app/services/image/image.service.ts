import { Level } from '@app/controllers/image/image.controller';
import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream, promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class ImageService {
    readonly pathData: string = '../server/assets/Data/';
    readonly pathDifference: string = '../server/assets/Difference/';
    readonly pathImage: string = '../server/assets/Images/';

    async getCardData(): Promise<Level[]> {
        const files = await fs.readdir(this.pathData);
        const jsonFiles = files.filter((file) => file.endsWith('.json'));

        const promises = jsonFiles.map(async (file) => {
            const fileContents = await fs.readFile(this.pathData + file, 'utf8');
            const data = JSON.parse(fileContents);
            const image = createReadStream(join(process.cwd(), this.pathImage + data.name + '/og.bmp'));
            data.imageOriginal = {
                stream: image,
                headers: {
                    'Content-Type': 'image/bmp',
                    'Content-Disposition': `attachment; filename=${data.name}.bmp`,
                },
            };
            console.log(data.imageOriginal);
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

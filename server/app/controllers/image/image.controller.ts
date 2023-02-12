import { Message } from '@app/model/schema/message.schema';
import { ImageService } from '@app/services/image/image.service';
import { Controller, Get, Res } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common/file-stream';
import { ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';

export interface Level {
    imageOriginal: StreamableFile;
    imageDiff: string;
    name: string;
    playerSolo: string[];
    timeSolo: number[];
    playerMulti: string[];
    timeMulti: number[];
    isEasy: boolean;
}

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Get('/AllLevels')
    @ApiOkResponse({
        description: 'Return information about http api',
        type: Message,
    })
    async getCardData(@Res() res: Response): Promise<void> {
        const levels = await this.imageService.getCardData();
        res.send(levels);
    }

    @Get('/originalImages')
    @Get('/image')
    @ApiOkResponse({
        description: 'Return information about http api',
        type: Message,
    })
    async getImageDifferences() {
        // je suppose qu'on a trouvé le id avec un autre foncion
        return this.imageService.getDifference('7-Rectangles', 0);
    }
}

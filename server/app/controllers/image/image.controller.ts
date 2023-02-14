import { Level, levels } from '@app/../assets/data/level';
import { Message } from '@app/model/schema/message.schema';
import { ImageService } from '@app/services/image/image.service';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Get('/AllLevels')
    /**
     * Gets the card data from the json files
     *
     * @returns the array of card data
     */
    @ApiOkResponse({
        description: 'Returns the card data',
        type: Message,
    })
    getCardData() {
        return levels;
    }

    @ApiOkResponse({
        description: 'Returns data for a level',
        type: Message,
    })
    @Get('/:id')
    getSingleGameData(@Param('id') id: string): Level {
        const idNumber = Number(id);
        const correctLevel = levels.find((level) => {
            return level.id === idNumber;
        });
        return correctLevel;
    }

    /**
     * Finds the difference between the original image and the modified image
     *
     * @param fileName The name of the file that has the differences
     * @param position The position of the pixel clicked
     * @returns the array of pixels that are different if there is a difference
     */
    // @ApiOkResponse({
    //     description: 'Finds if there is a difference on the pixel clicked',
    // })
    // @ApiBody({
    //     description: 'Details of the file and the position',
    //     schema: {
    //         type: 'object',
    //         properties: {
    //             differenceFile: {
    //                 type: 'string',
    //                 example: 'differences.json',
    //             },
    //             position: {
    //                 type: 'number',
    //                 example: 188540,
    //             },
    //         },
    //         required: ['differenceFile', 'position'],
    //     },
    // })
    // @Post('/difference')
    // async findImageDifference(@Body() body: { differenceFile: string; position: number }) {
    //     return this.imageService.findDifference(body.differenceFile, body.position);
    // }
}

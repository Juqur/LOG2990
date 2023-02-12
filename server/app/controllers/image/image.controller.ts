import { Message } from '@app/model/schema/message.schema';
import { ImageService } from '@app/services/image/image.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    /**
     * Gets the card data from the json files
     *
     * @returns the array of card data
     */
    @ApiOperation({
        description: 'Get card data from the imageService',
        summary: 'Retrieve card data',
    })
    @ApiResponse({
        description: 'Array of card data',
        type: [Array],
    })
    @ApiOkResponse({
        description: 'Returns the card data',
        type: Message,
    })
    @Get('/')
    async getCardData() {
        return this.imageService.getCardData();
    }

    /**
     * Finds the difference between the original image and the modified image
     *
     * @param fileName The name of the file that has the differences
     * @param position The position of the pixel clicked
     * @returns the array of pixels that are different if there is a difference
     */
    @ApiOkResponse({
        description: 'Finds if there is a difference on the pixel clicked',
    })
    @ApiBody({
        description: 'Details of the file and the position',
        schema: {
            type: 'object',
            properties: {
                differenceFile: {
                    type: 'string',
                    example: 'differences.json',
                },
                position: {
                    type: 'number',
                    example: 188540,
                },
            },
            required: ['differenceFile', 'position'],
        },
    })
    @Post('/difference')
    async findImageDifference(@Body() body: { differenceFile: string; position: number }) {
        return this.imageService.findDifference(body.differenceFile, body.position);
    }
}

import { Message } from '@app/model/schema/message.schema';
import { ImageService } from '@app/services/image/image.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { FileSystemStoredFile, FormDataRequest } from 'nestjs-form-data';

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
    })
    @Get('/')
    async getLevels() {
        return this.imageService.getLevels();
    }

    @ApiOkResponse({
        description: 'Returns the number of differences between the two images',
        type: Message,
    })
    @Get('/differenceCount')
    async differenceCount(@Body() body: { differenceFile: string }) {
        return this.imageService.differencesCount(body.differenceFile);
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

    /**
     * Writes the level data onto a json file for the game information and the images into the assets folder
     *
     * @param formData The data of the level
     * @returns the message of the result
     */
    @Post('/postLevel')
    @FormDataRequest({ storage: FileSystemStoredFile, autoDeleteFile: false, fileSystemStoragePath: '../server/assets/images' })
    async writeLevelData(@Body() formData: unknown): Promise<Message> {
        return this.imageService.writeLevelData(formData);
    }
}

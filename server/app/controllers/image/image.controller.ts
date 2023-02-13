import { Message } from '@app/model/schema/message.schema';
import { ImageService } from '@app/services/image/image.service';
import { Controller, Get, Body, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
        type: Message,
    })
    @Get('/')
    async getCardData() {
        return this.imageService.getLevels();
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

    @Post('/postLevel')
    @FormDataRequest({ storage: FileSystemStoredFile, autoDeleteFile: false, fileSystemStoragePath: '../server/assets/images' })
    async writeLevelData(@Body() formData: unknown): Promise<Message> {
        return this.imageService.writeLevelData(formData);
    }
}

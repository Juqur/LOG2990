import { Message } from '@app/model/schema/message.schema';
import { ImageService } from '@app/services/image/image.service';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Level } from 'assets/data/level';
import { FileSystemStoredFile, FormDataRequest } from 'nestjs-form-data';

/**
 * This controller provides the server API requests for the image data.
 *
 * @author Junaid Qureshi & Charles Degrandpré
 * @class ImageController
 */
@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    /**
     * Gets all the level information.
     *
     * @returns The array of levels data stored in the server.
     */
    @Get('/allLevels')
    @ApiOkResponse({
        description: 'Returns the card data',
    })
    async getLevels(): Promise<Level[]> {
        return await this.imageService.getLevels();
    }

    /**
     * Gets the level information.
     *
     * @param id The id of the level.
     * @returns The level data stored in the server.
     */
    @ApiOkResponse({
        description: 'Returns data for a level',
    })
    @Get('/:id')
    async getLevel(@Param('id') id: string): Promise<Level> {
        return await this.imageService.getLevel(parseInt(id, 10));
    }

    /**
     * Gets the amount of differences between the two images.
     *
     * @param formData The data of the level.
     * @returns The number of differences between the two images.
     */
    @Get('/differenceCount')
    @ApiOkResponse({
        description: 'Returns the number of differences between the two images',
    })
    async differenceCount(@Param('differenceFile') differenceFile: string): Promise<number> {
        return await this.imageService.differencesCount(differenceFile);
    }

    /**
     * Writes the level data onto a json file for the game information and the images into the assets folder.
     *
     * @param formData The data of the level.
     * @returns The message of the result.
     */
    @ApiOkResponse({
        description: 'Writes the level data onto a json file for the game information and the images into the assets folder.',
    })
    @Post('/postLevel')
    @FormDataRequest({ storage: FileSystemStoredFile, autoDeleteFile: false, fileSystemStoragePath: '../server/assets/images' })
    async writeLevelData(@Body() formData: unknown): Promise<Message> {
        return await this.imageService.writeLevelData(formData);
    }

    /**
     * Deletes the game data from the json file and the images from the assets folder.
     *
     * @param id The id of the level.
     * @returns The confirmation of the deletion.
     */
    @ApiOkResponse({
        description: 'Deletes the game data and its images in the server.',
    })
    @Delete('/:id')
    async deleteLevelData(@Param('id') id: string): Promise<boolean> {
        return await this.imageService.deleteLevelData(parseInt(id, 10));
    }
}

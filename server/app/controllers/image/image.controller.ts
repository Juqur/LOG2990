import { Message } from '@app/model/schema/message.schema';
import { GameService } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
    constructor(private readonly imageService: ImageService, private readonly gameService: GameService) {}

    /**
     * Gets all the level information.
     * This method also checks if the level is currently in the deletion queue and removes it from the list.
     * It also checks if the level is currently joinable and sets the canJoin property to true.
     *
     * @returns The array of levels data stored in the server.
     */
    @Get('/allLevels')
    @ApiOkResponse({
        description: 'Returns the card data',
    })
    async getLevels(): Promise<Level[]> {
        const levels = await this.imageService.getLevels();
        for (const levelId of this.gameService.getLevelDeletionQueue()) {
            for (let i = 0; i < levels.length; i++) {
                if (levels[i].id === levelId) {
                    levels.splice(i, 1);
                    break;
                }
            }
        }
        for (const levelId of this.gameService.getJoinableLevels()) {
            for (const level of levels) {
                if (level.id === levelId) {
                    level.canJoin = true;
                    break;
                }
            }
        }
        return levels;
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
}

import { Message } from '@app/model/schema/message.schema';
import { ImageService } from '@app/services/image/image.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Get('/')
    @ApiOkResponse({
        description: 'Return information about http api',
        type: Message,
    })
    async getCardData() {
        return this.imageService.getCardData();
    }

    // @ApiCreatedResponse({
    //    description: 'Send a message',
    // })
    @Post('/difference')
    async findImageDifference(@Body() body: { position: number }) {
        return await this.imageService.findDifference('7-Rectangles', body.position);
    }
}

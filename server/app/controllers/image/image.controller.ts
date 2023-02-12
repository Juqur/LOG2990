import { Message } from '@app/model/schema/message.schema';
import { ImageService } from '@app/services/image/image.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Get('/')
    @ApiOkResponse({
        description: 'Returns the card data',
        type: Message,
    })
    async getCardData() {
        return this.imageService.getCardData();
    }

    @ApiOkResponse({
        description: 'Finds if there is a difference on the pixel clicked',
    })
    @Post('/difference')
    async findImageDifference(@Body() body: { position: number }) {
        return this.imageService.findDifference('7-Rectangles', body.position);
    }
}

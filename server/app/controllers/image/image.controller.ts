import { Message } from '@app/model/schema/message.schema';
import { ImageService } from '@app/services/image/image.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}
    @Get()
    @ApiOkResponse({
        description: 'Return information about http api',
        type: Message,
    })
    async getCardData() {
        return this.imageService.getCardData();
    }
}

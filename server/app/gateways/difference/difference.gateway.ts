import { ImageServiceProvider } from '@app/providers/image.service.provider';
import { ImageService } from '@app/services/image/image.service';
import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DifferenceEvents } from './difference.gateway.events';

@WebSocketGateway({ cors: true, namespace: '/difference' })
export class DifferenceGateway {
    private readonly imageService: ImageService;

    constructor(private readonly logger: Logger, private imageServiceProvider: ImageServiceProvider) {
        this.imageService = imageServiceProvider.create();
    }

    @SubscribeMessage(DifferenceEvents.ReceiveClick)
    async handleMessage(socket: Socket, value: number) {
        this.logger.log(value);
        const result = this.imageService.findDifference('7', value);
        const array = await result;
        this.logger.log(array);
        socket.emit('sendCoord', array);
    }
}

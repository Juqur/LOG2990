import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class DifferenceGateway {
    @SubscribeMessage('message')
    handleMessage(client: unknown, payload: unknown): string {
        return 'Hello world!';
    }
}

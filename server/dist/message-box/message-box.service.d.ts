import { MessageDto } from './dto/message.dto';
export declare class MessageBoxService {
    messageList: MessageDto[];
    getMessages(): MessageDto[];
    create(message: MessageDto): number;
}

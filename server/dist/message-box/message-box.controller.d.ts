import { MessageDto } from './dto/message.dto';
import { MessageBoxService } from './message-box.service';
export declare class MessageBoxController {
    private messageBoxService;
    constructor(messageBoxService: MessageBoxService);
    getMessages(): MessageDto[];
}

import { Level } from '@common/interfaces/level';
import { ApiProperty } from '@nestjs/swagger';

export class Message {
    @ApiProperty()
    title: string;
    @ApiProperty()
    body: string;
    level?: Level;
}

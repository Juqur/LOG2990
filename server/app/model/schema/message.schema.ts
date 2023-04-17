import { ApiProperty } from '@nestjs/swagger';
import { Level } from 'assets/data/level';

export class Message {
    @ApiProperty()
    title: string;

    @ApiProperty()
    body: string;
    level?: Level;
}

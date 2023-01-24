import { Component, OnInit } from '@angular/core';
import { messages } from '@app/messages';

@Component({
    selector: 'app-game-chat',
    templateUrl: './game-chat.component.html',
    styleUrls: ['./game-chat.component.scss'],
})
export class GameChatComponent implements OnInit {
    messages = messages;

    constructor() {}

    ngOnInit(): void {}
}

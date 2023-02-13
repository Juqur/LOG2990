import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export enum Gateways {
    Timer = 'timer',
    Chat = 'chat',
    End = 'end',
    Game = 'game',
}
@Injectable({
    providedIn: 'root',
})
export class SocketHandler {
    socketTimer: Socket;
    socketChat: Socket;
    socketEnd: Socket;
    socketGame: Socket;

    isSocketAlive(type: Gateways) {
        switch (type) {
            case Gateways.Timer:
                return this.socketTimer && this.socketTimer.connected;
            case Gateways.Chat:
                return this.socketChat && this.socketChat.connected;
            case Gateways.End:
                return this.socketEnd && this.socketEnd.connected;
            case Gateways.Game:
                return this.socketGame && this.socketGame.connected;
        }
    }

    connect(type: Gateways) {
        switch (type) {
            case Gateways.Timer:
                this.socketTimer = io(environment.serverUrl + type, { transports: ['websocket'], upgrade: false });
                break;
            case Gateways.Chat:
                this.socketChat = io(environment.serverUrl + type, { transports: ['websocket'], upgrade: false });
                break;
            case Gateways.End:
                this.socketEnd = io(environment.serverUrl + type, { transports: ['websocket'], upgrade: false });
                break;
            case Gateways.Game:
                this.socketGame = io(environment.serverUrl + type, { transports: ['websocket'], upgrade: false });
                break;
        }
    }

    disconnect(type: Gateways) {
        switch (type) {
            case Gateways.Timer:
                this.socketTimer.disconnect();
                break;
            case Gateways.Chat:
                this.socketChat.disconnect();
                break;
            case Gateways.End:
                this.socketEnd.disconnect();
                break;
            case Gateways.Game:
                this.socketGame.disconnect();
                break;
        }
    }

    disconnectAll() {
        this.socketChat.disconnect();
        this.socketTimer.disconnect();
        this.socketEnd.disconnect();
        this.socketGame.disconnect();
    }

    on<T>(event: string, action: (data: T) => void, type: Gateways): void {
        switch (type) {
            case Gateways.Timer:
                this.socketTimer.on(event, action);
                break;
            case Gateways.Chat:
                this.socketChat.on(event, action);
                break;
            case Gateways.End:
                this.socketEnd.on(event, action);
                break;
            case Gateways.Game:
                this.socketGame.on(event, action);
                break;
        }
    }

    send<T>(type: Gateways, event: string, data?: T): void {
        switch (type) {
            case Gateways.Timer:
                if (data) {
                    this.socketTimer.emit(event, data);
                } else {
                    this.socketTimer.emit(event);
                }
                break;
            case Gateways.Chat:
                if (data) {
                    this.socketChat.emit(event, data);
                } else {
                    this.socketChat.emit(event);
                }
                break;
            case Gateways.End:
                if (data) {
                    this.socketEnd.emit(event, data);
                } else {
                    this.socketEnd.emit(event);
                }
                break;
            case Gateways.Game:
                if (data) {
                    this.socketGame.emit(event, data);
                } else {
                    this.socketGame.emit(event);
                }
                break;
        }
    }
}

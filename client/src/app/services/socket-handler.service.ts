import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export enum Gateways {
    Timer = 'timer',
    Chat = 'chat',
}

@Injectable({
    providedIn: 'root',
})
export class SocketHandler {
    socketTimer: Socket;
    socketChat: Socket;
    private serverUrl: string = environment.serverUrl;

    isSocketAlive(type: Gateways) {
        switch (type) {
            case Gateways.Timer:
                return this.socketTimer && this.socketTimer.connected;
            case Gateways.Chat:
                return this.socketChat && this.socketChat.connected;
        }
    }

    connect(type: Gateways) {
        switch (type) {
            case Gateways.Timer:
                console.log(this.serverUrl + type);
                console.log(environment.serverUrl + type);
                this.socketTimer = io(this.serverUrl + type, { transports: ['websocket'], upgrade: false });
                break;
            case Gateways.Chat:
                this.socketChat = io(this.serverUrl + type, { transports: ['websocket'], upgrade: false });
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
        }
    }

    disconnectAll() {
        this.socketChat.disconnect();
        this.socketTimer.disconnect();
    }

    on<T>(event: string, action: (data: T) => void, type: Gateways): void {
        switch (type) {
            case Gateways.Timer:
                this.socketTimer.on(event, action);
                break;
            case Gateways.Chat:
                this.socketChat.on(event, action);
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
        }
    }
}

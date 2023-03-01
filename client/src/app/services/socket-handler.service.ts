import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

/**
 * The different possible gateways to connect sockets to.
 */
export enum Gateways {
    Timer = 'timer',
    Chat = 'chat',
    Game = 'game',
}
@Injectable({
    providedIn: 'root',
})
/**
 * The service in charge of manipulating socket connections.
 *
 * @author Junaid Qureshi
 * @class SocketHandler
 */
export class SocketHandler {
    socketTimer: Socket;
    socketChat: Socket;
    socketGame: Socket;

    /**
     * This method verifies if a socket is connected at the given gateway.
     * It first checks if we created a socket of a given gateway and if that socket is currently
     * connected.
     *
     * @param type The gateway we wish to check if the socket is connected.
     */
    isSocketAlive(type: Gateways): boolean {
        switch (type) {
            case Gateways.Timer:
                return this.socketTimer && this.socketTimer.connected;
            case Gateways.Chat:
                return this.socketChat && this.socketChat.connected;
            case Gateways.Game:
                return this.socketGame && this.socketGame.connected;
        }
    }

    /**
     * Connects a socket to a given gateway.
     *
     * @param type the gateway to connect to.
     */
    connect(type: Gateways) {
        switch (type) {
            case Gateways.Timer:
                /**
                 * The following line does this: it tries to create a socket connected to the server
                 * at the given url, which in our case is a combination of server.url and the gateway type.
                 * We then specify what transport method we would like to use, websocket in our case, and if
                 * the connection should try to upgrade to a better transport method if possible, which we put
                 * as false.
                 */
                this.socketTimer = io(environment.serverUrl + type, { transports: ['websocket'], upgrade: false });
                break;
            case Gateways.Chat:
                this.socketChat = io(environment.serverUrl + type, { transports: ['websocket'], upgrade: false });
                break;
            case Gateways.Game:
                this.socketGame = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
                break;
        }
    }

    /**
     * Disconnects the socket of a give gateway.
     *
     * @param type the gateway to disconnect from.
     */
    disconnect(type: Gateways) {
        switch (type) {
            case Gateways.Timer:
                this.socketTimer.disconnect();
                break;
            case Gateways.Chat:
                this.socketChat.disconnect();
                break;
            case Gateways.Game:
                this.socketGame.disconnect();
                break;
        }
    }

    /**
     * Disconnect all sockets to every gateway.
     */
    disconnectAll() {
        this.socketChat.disconnect();
        this.socketTimer.disconnect();
        this.socketGame.disconnect();
    }

    /**
     * Associates a given event with an action and a gateway and executes said action on even for the
     * given gateway.
     *
     * @param event the event to process
     * @param action the action to perform on that event
     * @param type the socket on which this should all be performed.
     */
    on<T>(type: Gateways, event: string, action: (data: T) => void): void {
        switch (type) {
            case Gateways.Timer:
                this.socketTimer.on(event, action);
                break;
            case Gateways.Chat:
                this.socketChat.on(event, action);
                break;
            case Gateways.Game:
                this.socketGame.on(event, action);
                break;
        }
    }

    /**
     * The method emits an event on a given gateway and the data linked to that event if provided.
     *
     * @param type the gateway on which to send the event
     * @param event the event to emit via the socket.
     * @param data the data provided with the event. This parameter is options and may not be provided.
     */
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

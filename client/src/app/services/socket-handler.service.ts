import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

/**
 * The different possible gateways to connect sockets to.
 */
export enum Gateways {
    Timer = 'timer',
    Chat = 'chat',
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

    /**
     * Gets the socket of its kind, according to the given gateway.
     *
     * @param type The socket's gateway.
     * @returns The socket of the given gateway.
     */
    getSocket(type: Gateways): Socket {
        switch (type) {
            case Gateways.Timer:
                return this.socketTimer;
            case Gateways.Chat:
                return this.socketChat;
        }
    }

    /**
     * Sets the socket of its kind to an existing socket.
     *
     * @param type The socket's gateway.
     * @param socket The socket to set.
     * @returns The socket of the given gateway.
     */
    setSocket(type: Gateways, socket: Socket): void {
        switch (type) {
            case Gateways.Timer:
                this.socketTimer = socket;
                break;
            case Gateways.Chat:
                this.socketChat = socket;
                break;
        }
    }

    /**
     * This method verifies if a socket is connected at the given gateway.
     * It first checks if we created a socket of a given gateway and if that socket is currently
     * connected.
     *
     * @param type The gateway we wish to check if the socket is connected.
     * @returns a boolean indicating if a socket is alive at a given gateway.
     */
    isSocketAlive(type: Gateways): boolean {
        const socket = this.getSocket(type);
        return socket && socket.connected;
    }

    /**
     * Connects a socket to a given gateway.
     * URI : Combination of server.url and the gateway type.
     * Transport method specified as websocket.
     * Upgrade to a better transport method as false.
     *
     * @param type The gateway to connect to.
     */
    connect(type: Gateways) {
        this.setSocket(type, io(environment.serverUrl + type, { transports: ['websocket'], upgrade: false }));
    }

    /**
     * Disconnects the socket of a give gateway.
     *
     * @param type The gateway to disconnect from.
     */
    disconnect(type: Gateways) {
        return this.getSocket(type).disconnect();
    }

    /**
     * Disconnect all sockets to every gateway.
     */
    disconnectAll() {
        this.socketChat.disconnect();
        this.socketTimer.disconnect();
    }

    /**
     * Associates a given event with an action and a gateway and executes said action on even for the
     * given gateway.
     *
     * @param type The socket on which this should all be performed.
     * @param event The event to process
     * @param action The action to perform on that event
     */
    on<T>(type: Gateways, event: string, action: (data: T) => void): void {
        this.getSocket(type).on(event, action);
    }

    /**
     * The method emits an event on a given gateway and the data linked to that event if provided.
     *
     * @param type The gateway on which to send the event
     * @param event The event to emit via the socket.
     * @param data The data provided with the event. This parameter is options and may not be provided.
     */
    send<T>(type: Gateways, event: string, data?: T): void {
        if (data) {
            this.getSocket(type).emit(event, data);
        } else {
            this.getSocket(type).emit(event);
        }
    }
}

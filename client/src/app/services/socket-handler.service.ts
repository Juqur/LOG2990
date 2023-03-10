import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

/**
 * The service in charge of manipulating socket connections.
 *
 * @author Junaid Qureshi & Pierre Tran
 * @class SocketHandler
 */
@Injectable({
    providedIn: 'root',
})
export class SocketHandler {
    private sockets: Map<string, Socket> = new Map<string, Socket>();

    /**
     * Gets the socket of its kind, according to the given gateway.
     *
     * @param type The socket's gateway.
     * @returns The socket of the given gateway.
     */
    getSocket(gateway: string): Socket | undefined {
        return this.sockets.get(gateway);
    }

    /**
     * This method verifies if a socket is connected at the given gateway.
     *
     * @param type The gateway we wish to check if the socket is connected or even exists.
     * @returns a boolean indicating if a socket is alive at a given gateway.
     */
    isSocketAlive(gateway: string): boolean {
        const socket = this.getSocket(gateway);
        return socket !== undefined && socket.connected;
    }

    /**
     * Connects a socket to a given gateway.
     * URI : Combination of server.url and the gateway type.
     * Transport method specified as websocket.
     * Upgrade to a better transport method as false.
     *
     * @param type The gateway to connect to.
     */
    connect(type: string): void {
        this.sockets.set(type, io(environment.serverUrl + type, { transports: ['websocket'], upgrade: false }));
    }

    /**
     * Disconnects the socket of a give gateway.
     *
     * @param type The gateway to disconnect from.
     */
    disconnect(gateway: string): void {
        this.getSocket(gateway)?.disconnect();
    }

    /**
     * Disconnect all sockets to every gateway.
     */
    disconnectAll(): void {
        this.sockets.forEach((socket) => socket.disconnect());
    }

    /**
     * Associates a given event with an action and a gateway and executes said action on even for the
     * given gateway.
     *
     * @param type The gateway on which this should all be performed.
     * @param event The event to process
     * @param action The action to perform on that event
     */
    on<T>(gateway: string, event: string, action: (data: T) => void): void {
        this.getSocket(gateway)?.on(event, action);
    }

    /**
     * The method emits an event on a given gateway and the data linked to that event if provided.
     *
     * @param type The gateway on which to send the event
     * @param event The event to emit via the socket.
     * @param data The data provided with the event. This parameter is options and may not be provided.
     */
    send<T>(gateway: string, event: string, data?: T): void {
        if (data !== undefined) {
            this.getSocket(gateway)?.emit(event, data);
        } else {
            this.getSocket(gateway)?.emit(event);
        }
    }
}

/**
 * Socket test to mock the socket.io-client socket.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type CallbackSignature = (params: any) => {};
export class SocketTestHelper {
    private callbacks = new Map<string, CallbackSignature[]>();
    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event)?.push(callback);
    }

    disconnect(): void {
        return;
    }

    // eslint-disable-next-line no-unused-vars
    emit(event: string, ...params: any): void {
        return;
    }
}

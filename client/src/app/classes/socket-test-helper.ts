/**
 * Socket test to mock the socket.io-client socket.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-types
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

    emit(event: string, ...params: any): void {
        void event;
        void params;
    }
}

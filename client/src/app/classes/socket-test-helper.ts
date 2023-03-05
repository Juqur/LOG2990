/**
 * Socket test to mock the socket.io-client socket.
 */

type CallbackSignature = (params: Record<string, unknown>) => void;
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

    emit(event: string, ...params: unknown[]): void {
        void event;
        void params;
    }
}

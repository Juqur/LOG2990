export interface Message {
    sender: string;
    text: string;
    playerId: number;
}

export const messages: Message[] = [];

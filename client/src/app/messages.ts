export interface Message {
    sender: string;
    text: string;
    hourPosted: string; // Follows format HH:MM
    playerId: number;
}

export const messages = [];

/**
 * Message interface used for the chat.
 * Sender is either system, player or opponent.
 * SenderId is used to define the color of display.
 */
export interface ChatMessage {
    sender: string;
    senderId: string;
    text: string;
    timestamp: Date;
}

/**
 * Enum used to identify the sender of a message.
 * This is to display the opponent messages in another color.
 * It is used in the senderId attribute of the ChatMessage interface.
 */
export enum SenderType {
    Undefined = 'undefined',
    System = 'system',
    Player = 'player',
    Opponent = 'opponent',
}

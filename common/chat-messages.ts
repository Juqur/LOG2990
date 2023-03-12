/**
 * message interface used for the chat.
 * sender is either system, player1 or player2.
 */
export interface ChatMessage {
    sender: string;
    senderId: string;
    text: string;
}

/**
 * Enum used to identify the sender of a message.
 * player is the client, and opponent is the other player,
 * this is to display the opponent messages in another color
 */
export enum SenderType {
    Undefined = 'undefined',
    System = 'system',
    Player = 'player',
    Opponent = 'opponent',
}

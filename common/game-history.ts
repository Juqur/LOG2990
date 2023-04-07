export interface GameHistory {
    /**
     * The date at which the game was started
     */
    startDate: Date;

    /**
     * The length of the game in seconds as a number
     */
    lengthGame: number;

    /**
     * Boolean identifying if we are in classic mode or limited time mode
     */
    isClassic: boolean;

    /**
     * The name of the first player
     */
    firstPlayerName: string;

    /**
     * The name of the second player, if it is undefined then we have a game in solo
     */
    secondPlayerName: string | undefined;

    /**
     * This parameter identifies if the player has abandoned, in the case of two players it checks if the second
     * player has abandoned the game and in the case of single player it checks if the player has abandoned the game',
     */
    hasPlayerAbandoned: boolean;
}

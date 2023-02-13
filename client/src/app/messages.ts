export interface Message {
    sender: string;
    text: string;
    playerId: number;
}

export const messages = [
    {
        sender: 'Charles',
        text: 'Hello world',
        playerId: 1,
    },
    {
        sender: 'Bob',
        text: 'I am a',
        playerId: 2,
    },
    {
        sender:
            'Jugemu Jugemu Gokō-no Surikire Kaijarisuigyo-no Suigyōmatsu Unraimatsu Fūraimatsu Kūnerutokoro-ni' +
            'Sumutokoro Yaburakōji-no Burakōji Paipopaipo Paipo-no Shūringan Shūringan-no Gūrindai Gūrindai-no Ponpokopii-no ' +
            'Ponpokonā-no Chōkyūmei-no Chōsuke',
        text: 'computer program. Test with a super long text to see how it reacts.',
        playerId: 1,
    },
];

export interface Message {
    sender: string;
    text: string;
    hourPosted: string; // Follows format HH:MM
    playerId: number;
}

export const messages = [
    {
        sender: 'Charles',
        text: 'Hello world',
        hourPosted: '01:01',
        playerId: 1,
    },
    {
        sender: 'Bob',
        text: 'I am a',
        hourPosted: '14:01',
        playerId: 2,
    },
    {
        sender:
            'Jugemu Jugemu Gokō-no Surikire Kaijarisuigyo-no Suigyōmatsu Unraimatsu Fūraimatsu Kūnerutokoro-ni' +
            'Sumutokoro Yaburakōji-no Burakōji Paipopaipo Paipo-no Shūringan Shūringan-no Gūrindai Gūrindai-no Ponpokopii-no ' +
            'Ponpokonā-no Chōkyūmei-no Chōsuke',
        text: 'computer program. Test with a super long text to see how it reacts.',
        hourPosted: '07:18',
        playerId: 1,
    },
];

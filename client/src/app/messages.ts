export interface Message {
    sender: string;
    message: string;
    hourPosted: string; // Follows format HH:MM
}

export const messages = [
    {
        sender: 'Charles',
        message: 'Hellow world',
        hourPosted: '01:01',
    },
    {
        sender: 'Bob',
        message: 'I am a',
        hourPosted: '14:01',
    },
    {
        sender: 'Chris',
        message: 'computer program',
        hourPosted: '07:18',
    },
];

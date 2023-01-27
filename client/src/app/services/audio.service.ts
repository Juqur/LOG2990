import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    soundtrack: HTMLAudioElement;
    constructor() {
        this.soundtrack = new Audio();
        this.soundtrack.src = './assets/audio/soundtrack.mp3';
    }
    /**
     * Plays the audio file at the given path.
     *
     * @param path The path to the audio file.
     */
    playAudio(path: string): void {
        const audio = new Audio();
        audio.src = path;
        audio.load();

        // We can't assume the audio will play. It may be blocked by the browser.
        // See https://developer.chrome.com/blog/autoplay/
        const promise = audio?.play();
        if (promise) {
            promise
                .then(() => {
                    // Autoplay is allowed.
                })
                .catch(() => {
                    // Autoplay was prevented.
                });
        }
    }
}

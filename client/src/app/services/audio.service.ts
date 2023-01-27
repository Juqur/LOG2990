import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    soundtrack: HTMLAudioElement;

    /**
     * Creates an audio element.
     *
     * @param path The path to the audio file.
     * @returns The audio element.
     */
    create(path: string): HTMLAudioElement {
        const audio = new Audio();
        audio.src = path;
        audio.load();
        return audio;
    }

    /**
     * Plays the audio file at the given path.
     * We can't assume the audio will play. It may be blocked by the browser.
     * See https://developer.chrome.com/blog/autoplay/
     *
     * @param path The path to the audio file.
     */
    play(audio: HTMLAudioElement): void {
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

    /**
     * Instances an audio and plays it once.
     * Multiple sounds can be played at the same time.
     *
     * @param path The path to the audio file.
     */
    playSound(path: string): void {
        const audio = this.create(path);
        this.play(audio);
    }

    /**
     * Mutes or unmute the audio. If an audio element is provided, it will be muted.
     *
     * @param audio The audio element to mute. If not provided, the soundtrack will be muted.
     */
    mute(audio?: HTMLAudioElement) {
        if (audio) {
            audio.muted = !audio.muted;
        } else {
            this.soundtrack.muted = !this.soundtrack.muted;
        }
    }
}

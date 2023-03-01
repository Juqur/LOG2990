import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
/**
 * This service is in charge of the manipulation of an audio element. It is used in combination with
 * a single audio file and offers methods to interact with said audio file.
 *
 * @author Pierre Tran
 * @class AudioService
 */
export class AudioService {
    private soundtrack: HTMLAudioElement;

    /**
     * This method play a sound file and then terminates it when it has completed playing.
     * It used to play ping sounds or click sounds that aren't meant to be played for long and aren't
     * supposed to be paused or looped.
     *
     * @param path the source file path as a string
     */
    static quickPlay(path: string): void {
        const audio = new Audio(path);
        audio.play();
    }

    /**
     * Initializes the soudtrack attribute to a new HTMLAudioElement containing the new src.
     *
     * @param path The path to the audio file.
     */
    create(filePath: string): void {
        this.soundtrack = new Audio();
        this.soundtrack.src = filePath;
        this.soundtrack.load();
    }

    /**
     * Plays the audio associated with the soundtrack.
     * We can't assume the audio will play. It may be blocked by the browser.
     * See https://developer.chrome.com/blog/autoplay/
     */
    play(): void {
        const promise = this.soundtrack?.play();
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
     * Mutes or unmute the audio of the soundtrack.
     * If this method has been called before the initialization of the audio element, then it shouldn't mute.
     */
    mute(): void {
        if (this.soundtrack) {
            this.soundtrack.muted = !this.soundtrack.muted;
        }
    }

    /**
     * Loops or un loops the audio element. If this method is called before the
     * initialization of the audio element then it should not loop.
     */
    loop(): void {
        if (this.soundtrack) {
            this.soundtrack.loop = !this.soundtrack.loop;
        }
    }

    /**
     * Method used to reset the audio back to it's base state.
     */
    reset(): void {
        this.soundtrack?.load();
    }
}

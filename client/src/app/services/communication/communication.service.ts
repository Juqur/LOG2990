import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LevelFormData } from '@app/classes/level-form-data';
import { GameConstants } from '@common/game-constants';
import { GameHistory } from '@common/game-history';
import { HttpMessage } from '@common/interfaces/http-message';
import { Level } from '@common/interfaces/level';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

/**
 * This service is used in order to make HTTP requests to the server.
 *
 * @author Junaid Qureshi
 * @class CommunicationService
 */
@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    /**
     * This get HTTP method makes a request to obtain all stored levels from the server.
     *
     * @returns an observable on the array of all contained levels.
     */
    getLevels(): Observable<Level[]> {
        return this.http.get<Level[]>(`${this.baseUrl}api` + '/image/allLevels').pipe(catchError(this.handleError<Level[]>('basicGet')));
    }

    /**
     * This get HTTP method takes an ID to the appropriate level and returns it from the server.
     *
     * @param levelId the id of the level we wish to obtain
     * @returns an observable on the appropriate level.
     */
    getLevel(levelId: number): Observable<Level> {
        return this.http.get<Level>(`${this.baseUrl}api` + '/image/' + levelId).pipe(catchError(this.handleError<Level>('basicGet')));
    }

    /**
     * This post HTTP method is used to send the coordinate of a click to a given game to the server. It then determines
     * inside the server wether or not the click was on a difference and returns to us an array containing, or not, the
     * coordinates of every pixel composing that difference.
     *
     * @param gameId the id of the game we are associated with.
     * @param position the coordinate in 1 dimension that we have clicked on.
     * @returns an observable on a array of numbers. The array is empty if no differences where found.
     */
    postDifference(gameId: string | null, position: number): Observable<number[]> {
        return this.http
            .post<number[]>(`${this.baseUrl}api/game/difference`, { gameId, position }, { observe: 'response', responseType: 'json' })
            .pipe(
                map((response) => response.body || []),
                catchError(this.handleError<number[]>('basicPost')),
            );
    }

    /**
     * This post HTTP request is used to add a new level to the server. It is important to not that this method should only be used
     * from the creation page as it makes no check to see if the level has valid parameters, such as a correct
     * amount of differences.
     *
     * @param level a LevelFormData attribute containing the necessary information to post a level on the server.
     * @returns a message indicating that the level was added with success to teh server.
     */
    postLevel(level: LevelFormData): Observable<HttpMessage> {
        const formData = new FormData();
        formData.append('imageOriginal', level.imageOriginal);
        formData.append('imageDiff', level.imageDiff);
        formData.append('name', level.name);
        formData.append('isEasy', level.isEasy);
        formData.append('clusters', level.clusters);
        formData.append('nbDifferences', level.nbDifferences);

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        return this.http
            .post<HttpMessage>(`${this.baseUrl}api/image/postLevel`, formData, { headers })
            .pipe(catchError(this.handleError<HttpMessage>('basicPost')));
    }

    /**
     * This functions is used to send a request to the server to create a new game. It returns, if the creation was
     * successful the gameId which represents the game.
     *
     * @param imageId the id of the image linked to the new game we wish to start
     * @returns the id of the game we just created as a string
     */
    postNewGame(imageId: string): Observable<string | null> {
        return this.http.post<string>(`${this.baseUrl}api` + '/game', { imageId }, { observe: 'response', responseType: 'json' }).pipe(
            map((response) => response.body),
            catchError(this.handleError<string | null>('basicPost')),
        );
    }

    /**
     * This functions is used to send a request to the server to delete a level.
     *
     * @param imageId The id of the level to delete in the database.
     * @returns the confirmation of the deletion.
     */
    deleteLevel(levelId: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.baseUrl}api` + '/image/' + levelId);
    }

    /**
     * This function is used to obtain the current game constants from the database.
     *
     * @returns The game constants.
     */
    getGameConstants(): Observable<GameConstants> {
        return this.http
            .get<GameConstants>(`${this.baseUrl}api` + '/database/constants')
            .pipe(catchError(this.handleError<GameConstants>('getGameConstants')));
    }

    /**
     * This function resets the game constants to their base values.
     */
    resetGameConstants(): Observable<void> {
        return this.http
            .patch<void>(`${this.baseUrl}api` + '/database/constants/reset', null)
            .pipe(catchError(this.handleError<void>('getGameConstants')));
    }

    /**
     * This method sets the new game constants to the new provided values.
     *
     * @param gameConstants The new game constants.
     */
    setNewGameConstants(gameConstants: GameConstants): Observable<void> {
        return this.http
            .patch<void>(`${this.baseUrl}api` + '/database/constants', { gameConstants })
            .pipe(catchError(this.handleError<void>('getGameConstants')));
    }

    /**
     * This methods is used to obtain all the game histories from the database.
     *
     * @returns An array containing all the game histories.
     */
    getGameHistories(): Observable<GameHistory[]> {
        return this.http
            .get<GameHistory[]>(`${this.baseUrl}api` + '/database/gameHistories')
            .pipe(catchError(this.handleError<GameHistory[]>('getGameHistories')));
    }

    /**
     * This method makes a call to the server to delete all game histories.
     */
    deleteGameHistories(): Observable<void> {
        return this.http
            .delete<void>(`${this.baseUrl}api` + '/database/gameHistories')
            .pipe(catchError(this.handleError<void>('deleteGameHistories')));
    }

    /**
     * Method used to handel possible errors generated by HTTP request.
     *
     * @param request a string identifying the type of request that generated the error
     * @param result the result of the request that generated an error
     * @returns an observable on the result
     */
    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}

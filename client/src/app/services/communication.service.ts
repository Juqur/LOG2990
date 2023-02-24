import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Level } from '@app/levels';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
/**
 * This service is used in order to share the canvases to components that need both in easy access
 *
 * @author Simon Gagné
 * @class CanvasSharingService
 */
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getMessage(path: string): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}api` + path).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    getLevels(path: string): Observable<Level[]> {
        return this.http.get<Level[]>(`${this.baseUrl}api` + path).pipe(catchError(this.handleError<Level[]>('basicGet')));
    }

    get(path: string): Observable<unknown> {
        return this.http.get(`${this.baseUrl}api` + path);
    }

    getLevel(levelId: number): Observable<Level> {
        return this.http.get<Level>(`${this.baseUrl}api` + '/image/' + levelId);
    }

    getDifferenceCount(differenceFile: string): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}api/image/differenceCount/${differenceFile}`);
    }

    postDifference(gameId: string | null, position: number): Observable<number[]> {
        return this.http
            .post<number[]>(`${this.baseUrl}api/game/difference`, { gameId, position }, { observe: 'response', responseType: 'json' })
            .pipe(map((response) => response.body || []));
    }

    postLevel(level: FormData): Observable<Message> {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        return this.http
            .post<Message>(`${this.baseUrl}api/image/postLevel`, level, { headers })
            .pipe(catchError(this.handleError<Message>('basicPost')));
    }

    postNewGame(path: string, imageId: string) {
        return this.http
            .post<string>(`${this.baseUrl}api` + path, { imageId }, { observe: 'response', responseType: 'json' })
            .pipe(map((response) => response.body));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}

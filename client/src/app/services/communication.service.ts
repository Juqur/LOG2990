import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Level } from '@app/levels';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getMessage(path: string): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}api` + path).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    getLevel(path: string): Observable<Level[]> {
        return this.http.get<Level[]>(`${this.baseUrl}api` + path).pipe(catchError(this.handleError<Level[]>('basicGet')));
    }

    get(path: string): Observable<unknown> {
        return this.http.get(`${this.baseUrl}api` + path);
    }

    postDifference(path: string, differenceFile: string, position: number): Observable<number[]> {
        return this.http
            .post<number[]>(`${this.baseUrl}api` + path, { differenceFile, position }, { observe: 'response', responseType: 'json' })
            .pipe(map((response) => response.body || []));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}

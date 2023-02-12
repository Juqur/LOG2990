import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Level } from '@app/levels';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

    getLevels(path: string): Observable<Level[]> {
        return this.http.get<Level[]>(`${this.baseUrl}api` + path).pipe(catchError(this.handleError<Level[]>('basicGet')));
    }

    get(path: string): Observable<unknown> {
        return this.http.get(`${this.baseUrl}api` + path);
    }

    basicPost(message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/example/send`, message, { observe: 'response', responseType: 'text' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}

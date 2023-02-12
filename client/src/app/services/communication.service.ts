import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

    get(path: string): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}api` + path).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    getArray(path: string): Observable<unknown> {
        return this.http.get(`${this.baseUrl}api` + path);
    }

    basicPost(message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/example/send`, message, { observe: 'response', responseType: 'text' });
    }

    async findDifference(name: string, position: number): Promise<number[]> {
        return this.http.post<number[]>(`${this.baseUrl}api` + path, { name, position });
    }

    // postDifference(path: string, position: number): Observable<HttpResponse<number[]>> {
    //     return this.http.post(`${this.baseUrl}/api` + path, position, { observe: 'response', responseType: 'number[]' });
    // }

    // postDifference(path: string, position: number): Observable<HttpResponse<unknown>> {
    //     return this.http.post(`${this.baseUrl}/api` + path, position, { observe: 'response', responseType: 'json' });
    // }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}

import { Injectable, inject } from '@angular/core';
import {
    HttpClient,
    HttpDownloadProgressEvent,
    HttpEventType,
    HttpResponse,
} from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';
import { ChatMessage, UploadResponse } from './models';
import { parseNdjsonTokens } from './ndjson';

@Injectable({ providedIn: 'root' })
export class DocumentApi {
    private readonly http = inject(HttpClient);

    upload(file: File): Observable<UploadResponse> {
        const form = new FormData();
        form.append('file', file);
        return this.http.post<UploadResponse>('/api/documents', form);
    }

    summarize(documentId: string): Observable<string> {
        return this.streamText(`/api/documents/${encodeURIComponent(documentId)}/summary`, null);
    }

    ask(question: string, documentId: string, history: readonly ChatMessage[] = []): Observable<string> {
        return this.streamText('/api/chat', { question, documentId, history });
    }

    /** POSTs and emits the full text received so far each time new data arrives. */
    private streamText(url: string, body: unknown): Observable<string> {
        return this.http
            .post(url, body, { responseType: 'text', observe: 'events', reportProgress: true })
            .pipe(
                filter(e => e.type === HttpEventType.DownloadProgress || e.type === HttpEventType.Response),
                map(e => {
                    const raw =
                        e.type === HttpEventType.DownloadProgress
                            ? ((e as HttpDownloadProgressEvent).partialText ?? '')
                            : ((e as HttpResponse<string>).body ?? '');
                    return parseNdjsonTokens(raw);
                }),
            );
    }
}
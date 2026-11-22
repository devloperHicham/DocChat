import { HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DocumentApi } from './document-api';
import { UploadResponse } from './models';

describe('DocumentApi', () => {
    let api: DocumentApi;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(DocumentApi);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('uploads the file as multipart form data', () => {
        const file = new File(['%PDF-1.7'], 'a.pdf', { type: 'application/pdf' });
        let result: UploadResponse | undefined;

        api.upload(file).subscribe(response => (result = response));

        const req = http.expectOne('/api/documents');
        expect(req.request.method).toBe('POST');
        expect(req.request.body instanceof FormData).toBe(true);
        expect((req.request.body as FormData).get('file')).toBeTruthy();
        req.flush({ documentId: 'id-1', filename: 'a.pdf', chunks: 3 });

        expect(result).toEqual({ documentId: 'id-1', filename: 'a.pdf', chunks: 3 });
    });

    it('sends the question, the document id and the history', () => {
        const history = [{ role: 'user' as const, text: 'Hi' }];
        api.ask('What is RAG?', 'id-1', history).subscribe();

        const req = http.expectOne('/api/chat');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ question: 'What is RAG?', documentId: 'id-1', history });
        req.flush('');
    });

    it('sends an empty history by default', () => {
        api.ask('q', 'id-1').subscribe();

        const req = http.expectOne('/api/chat');
        expect(req.request.body).toEqual({ question: 'q', documentId: 'id-1', history: [] });
        req.flush('');
    });

    it('requests the summary of the right document', () => {
        api.summarize('id-1').subscribe();

        const req = http.expectOne('/api/documents/id-1/summary');
        expect(req.request.method).toBe('POST');
        req.flush('');
    });

    it('emits the answer progressively while it streams', () => {
        const emissions: string[] = [];
        api.ask('q', 'id-1').subscribe(text => emissions.push(text));

        const req = http.expectOne('/api/chat');
        req.event({ type: HttpEventType.DownloadProgress, loaded: 12, partialText: '{"t":"Hel"}\n' });
        req.event({
            type: HttpEventType.DownloadProgress,
            loaded: 25,
            partialText: '{"t":"Hel"}\n{"t":"lo"}\n{"t":',
        });
        req.flush('{"t":"Hel"}\n{"t":"lo"}\n');

        expect(emissions).toEqual(['Hel', 'Hello', 'Hello']);
    });

    it('propagates server errors', () => {
        let failed = false;
        api.ask('q', 'id-1').subscribe({ error: () => (failed = true) });

        http.expectOne('/api/chat').flush('boom', { status: 500, statusText: 'Server Error' });

        expect(failed).toBe(true);
    });
});
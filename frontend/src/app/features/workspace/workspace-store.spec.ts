import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { DocumentApi } from '../../core/document-api';
import { ChatMessage, MAX_PDF_BYTES, UploadResponse } from '../../core/models';
import { WorkspaceStore } from './workspace-store';

class FakeDocumentApi {
    readonly uploads = new Subject<UploadResponse>();
    readonly summaries = new Subject<string>();
    readonly answers = new Subject<string>();
    uploadCalls = 0;
    readonly askCalls: { question: string; documentId: string; history: readonly ChatMessage[] }[] = [];

    upload(): Observable<UploadResponse> {
        this.uploadCalls++;
        return this.uploads.asObservable();
    }
    summarize(): Observable<string> {
        return this.summaries.asObservable();
    }
    ask(question: string, documentId: string, history: readonly ChatMessage[] = []): Observable<string> {
        this.askCalls.push({ question, documentId, history });
        return this.answers.asObservable();
    }
}

const pdf = (name = 'a.pdf') => new File(['%PDF-1.7'], name, { type: 'application/pdf' });

describe('WorkspaceStore', () => {
    let api: FakeDocumentApi;
    let store: WorkspaceStore;

    beforeEach(() => {
        api = new FakeDocumentApi();
        TestBed.configureTestingModule({ providers: [{ provide: DocumentApi, useValue: api }] });
        store = TestBed.inject(WorkspaceStore);
    });

    const makeReady = () => {
        store.upload(pdf());
        api.uploads.next({ documentId: 'id-1', filename: 'a.pdf', chunks: 5 });
        api.summaries.next('A summary');
        api.summaries.complete();
    };

    it('starts on the upload screen', () => {
        expect(store.phase()).toBe('empty');
    });

    it('rejects files that are not PDFs without calling the API', () => {
        store.upload(new File(['x'], 'notes.txt', { type: 'text/plain' }));

        expect(store.uploadError()).toBe('Please choose a PDF file.');
        expect(store.phase()).toBe('empty');
        expect(api.uploadCalls).toBe(0);
    });

    it('rejects files over the size limit', () => {
        const big = pdf('big.pdf');
        Object.defineProperty(big, 'size', { value: MAX_PDF_BYTES + 1 });

        store.upload(big);

        expect(store.uploadError()).toBe('The file is larger than 20 MB.');
        expect(api.uploadCalls).toBe(0);
    });

    it('shows the processing screen while the document is analyzed', () => {
        store.upload(pdf('report.pdf'));

        expect(store.phase()).toBe('processing');
        expect(store.step()).toBe('indexing');
        expect(store.fileName()).toBe('report.pdf');
    });

    it('keeps the result hidden until the summary is complete', () => {
        store.upload(pdf());
        api.uploads.next({ documentId: 'id-1', filename: 'a.pdf', chunks: 5 });
        expect(store.step()).toBe('summary');

        api.summaries.next('Part of the summary');
        expect(store.phase()).toBe('processing');

        api.summaries.complete();
        expect(store.phase()).toBe('ready');
        expect(store.summary()).toBe('Part of the summary');
        expect(store.chunks()).toBe(5);
    });

    it('returns to the upload screen with the backend message when the upload fails', () => {
        store.upload(pdf());
        api.uploads.error({ error: { detail: 'The uploaded file is not a valid PDF.' } });

        expect(store.phase()).toBe('empty');
        expect(store.uploadError()).toBe('The uploaded file is not a valid PDF.');
    });

    it('explains rate limiting in plain words', () => {
        store.upload(pdf());
        api.uploads.error({ status: 429 });

        expect(store.uploadError()).toContain('Too many requests');
    });

    it('still opens the workspace when only the summary fails', () => {
        store.upload(pdf());
        api.uploads.next({ documentId: 'id-1', filename: 'a.pdf', chunks: 5 });
        api.summaries.error(new Error('boom'));

        expect(store.phase()).toBe('ready');
        expect(store.summaryFailed()).toBe(true);
    });

    it('cancels the analysis and ignores late results when starting over', () => {
        store.upload(pdf());
        store.startOver();
        api.uploads.next({ documentId: 'id-1', filename: 'a.pdf', chunks: 5 });

        expect(store.phase()).toBe('empty');
        expect(store.documentId()).toBeNull();
    });

    it('streams an answer into the last assistant message', () => {
        makeReady();

        store.ask('  What is RAG?  ');
        expect(api.askCalls[0].question).toBe('What is RAG?');
        expect(store.asking()).toBe(true);

        api.answers.next('Retrieval');
        api.answers.next('Retrieval Augmented Generation');
        api.answers.complete();

        expect(store.messages()).toEqual([
            { role: 'user', text: 'What is RAG?' },
            { role: 'assistant', text: 'Retrieval Augmented Generation' },
        ]);
        expect(store.asking()).toBe(false);
    });

    it('sends the previous messages so follow-up questions work', () => {
        makeReady();
        store.ask('First');
        api.answers.next('Answer one');
        api.answers.complete();

        api.answers.observed; // no-op guard for readability
        store.ask('more');

        expect(api.askCalls[1].history).toEqual([
            { role: 'user', text: 'First' },
            { role: 'assistant', text: 'Answer one' },
        ]);
    });

    it('ignores questions before the document is ready, empty questions, and questions while answering', () => {
        store.ask('Too early');
        expect(api.askCalls.length).toBe(0);

        makeReady();
        store.ask('   ');
        expect(api.askCalls.length).toBe(0);

        store.ask('First');
        store.ask('Second');
        expect(api.askCalls.length).toBe(1);
    });

    it('shows a fallback message when the answer fails', () => {
        makeReady();
        store.ask('Why?');

        api.answers.error(new Error('network'));

        expect(store.messages()[1].text).toBe('Sorry, the answer could not be generated.');
        expect(store.asking()).toBe(false);
    });
});
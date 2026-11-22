import { Injectable, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { DocumentApi } from '../../core/document-api';
import {
    ChatMessage,
    MAX_HISTORY_MESSAGES,
    MAX_PDF_BYTES,
    MobileView,
    Phase,
    ProcessingStep,
} from '../../core/models';

@Injectable({ providedIn: 'root' })
export class WorkspaceStore {
    private readonly api = inject(DocumentApi);
    private readonly subscriptions = new Set<Subscription>();

    /** empty → processing → ready. Nothing is shown from the document until the whole analysis is done. */
    readonly phase = signal<Phase>('empty');
    readonly step = signal<ProcessingStep>('indexing');
    readonly mobileView = signal<MobileView>('summary');

    readonly fileName = signal('');
    readonly fileSize = signal(0);
    readonly documentId = signal<string | null>(null);
    readonly chunks = signal(0);
    readonly uploadError = signal('');

    readonly summary = signal('');
    readonly summaryFailed = signal(false);

    readonly messages = signal<ChatMessage[]>([]);
    readonly asking = signal(false);

    setMobileView(view: MobileView): void {
        this.mobileView.set(view);
    }

    upload(file: File): void {
        const problem = this.validate(file);
        if (problem) {
            this.uploadError.set(problem);
            return;
        }
        this.reset();
        this.fileName.set(file.name);
        this.fileSize.set(file.size);
        this.phase.set('processing');
        this.step.set('indexing');

        this.track(
            this.api.upload(file).subscribe({
                next: response => {
                    this.documentId.set(response.documentId);
                    this.fileName.set(response.filename);
                    this.chunks.set(response.chunks);
                    this.loadSummary(response.documentId);
                },
                error: err => {
                    this.reset();
                    this.uploadError.set(this.errorMessage(err, 'The document could not be processed. Please try again.'));
                },
            }),
        );
    }

    /** Cancels any running work and returns to the upload screen. */
    startOver(): void {
        this.reset();
    }

    ask(question: string): void {
        const documentId = this.documentId();
        const text = question.trim();
        if (this.phase() !== 'ready' || !documentId || !text || this.asking()) {
            return;
        }
        const history = this.messages().filter(m => m.text).slice(-MAX_HISTORY_MESSAGES);

        this.asking.set(true);
        this.messages.update(list => [
            ...list,
            { role: 'user', text },
            { role: 'assistant', text: '' },
        ]);

        this.track(
            this.api.ask(text, documentId, history).subscribe({
                next: answer => this.setLastAnswer(answer),
                error: err => {
                    this.setLastAnswer(this.errorMessage(err, 'Sorry, the answer could not be generated.'));
                    this.asking.set(false);
                },
                complete: () => this.asking.set(false),
            }),
        );
    }

    private loadSummary(documentId: string): void {
        this.step.set('summary');
        this.track(
            this.api.summarize(documentId).subscribe({
                next: text => this.summary.set(text),
                error: () => {
                    this.summaryFailed.set(true);
                    this.finish();
                },
                complete: () => this.finish(),
            }),
        );
    }

    private finish(): void {
        this.mobileView.set('summary');
        this.phase.set('ready');
    }

    private setLastAnswer(text: string): void {
        this.messages.update(list => list.map((m, i) => (i === list.length - 1 ? { ...m, text } : m)));
    }

    private validate(file: File): string | null {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            return 'Please choose a PDF file.';
        }
        if (file.size > MAX_PDF_BYTES) {
            return 'The file is larger than 20 MB.';
        }
        return null;
    }

    private reset(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions.clear();
        this.phase.set('empty');
        this.step.set('indexing');
        this.fileName.set('');
        this.fileSize.set(0);
        this.documentId.set(null);
        this.chunks.set(0);
        this.uploadError.set('');
        this.summary.set('');
        this.summaryFailed.set(false);
        this.messages.set([]);
        this.asking.set(false);
    }

    private track(subscription: Subscription): void {
        this.subscriptions.add(subscription);
    }

    /** Friendly message for rate limiting, otherwise the backend's ProblemDetail text. */
    private errorMessage(err: unknown, fallback: string): string {
        const e = err as { status?: number; error?: { detail?: string } } | null;
        if (e?.status === 429) {
            return 'Too many requests. Please wait a moment and try again.';
        }
        return e?.error?.detail ?? fallback;
    }
}
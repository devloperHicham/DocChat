export type Phase = 'empty' | 'processing' | 'ready';
export type ProcessingStep = 'indexing' | 'summary';
export type MobileView = 'summary' | 'chat';

export interface UploadResponse {
    readonly documentId: string;
    readonly filename: string;
    readonly chunks: number;
}

export interface ChatMessage {
    readonly role: 'user' | 'assistant';
    readonly text: string;
}

/** Same sentences the backend returns; they are shown in an amber "notice" bubble. */
export const NOT_FOUND_MESSAGE = 'This information is not in the document.';
export const BLOCKED_MESSAGE = 'I can only answer questions about the uploaded document.';
export const NOTICE_MESSAGES: ReadonlySet<string> = new Set([NOT_FOUND_MESSAGE, BLOCKED_MESSAGE]);

/** Same limit as the backend (spring.servlet.multipart.max-file-size). */
export const MAX_PDF_BYTES = 20 * 1024 * 1024;

/** Previous messages sent with a question so follow-ups like "more" work. */
export const MAX_HISTORY_MESSAGES = 4;

export const SUGGESTED_QUESTIONS: readonly string[] = [
    'Summarize the document',
    'What are the key points?',
    'What is the main idea?',
];
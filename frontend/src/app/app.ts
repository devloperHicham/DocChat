import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MobileView, SUGGESTED_QUESTIONS } from './core/models';
import { ChatPanel } from './features/chat/chat-panel/chat-panel';
import { DocumentPanel } from './features/document/document-panel/document-panel';
import { ProcessingScreen } from './features/processing/processing-screen/processing-screen';
import { UploadScreen } from './features/upload/upload-screen/upload-screen';
import { WorkspaceStore } from './features/workspace/workspace-store';
import { Header } from './layout/header/header';
import { ConfirmDialog } from './shared/ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [Header, UploadScreen, ProcessingScreen, DocumentPanel, ChatPanel, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(WorkspaceStore);
  protected readonly suggestions = SUGGESTED_QUESTIONS;
  protected readonly mobileViews: readonly { readonly view: MobileView; readonly label: string }[] = [
    { view: 'summary', label: 'Summary' },
    { view: 'chat', label: 'Chat' },
  ];

  protected readonly confirmNewOpen = signal(false);
  protected readonly confirmNewMessage = computed(
    () => `If you continue, your conversation about “${this.store.fileName() || 'this document'}” will be lost.`,
  );

  protected startNew(): void {
    this.confirmNewOpen.set(false);
    this.store.startOver();
  }
}
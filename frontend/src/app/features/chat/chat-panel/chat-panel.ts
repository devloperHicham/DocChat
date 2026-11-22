import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ChatMessage, NOTICE_MESSAGES } from '../../../core/models';

@Component({
  selector: 'app-chat-panel',
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPanel {
  readonly messages = input.required<readonly ChatMessage[]>();
  readonly asking = input(false);
  readonly suggestions = input<readonly string[]>([]);

  readonly questionSubmitted = output<string>();

  protected readonly draft = signal('');
  protected readonly canSend = computed(() => !this.asking() && this.draft().trim().length > 0);

  private readonly log = viewChild<ElementRef<HTMLElement>>('log');

  constructor() {
    // Keep the newest message in view while the answer streams in.
    effect(() => {
      this.messages();
      const element = this.log()?.nativeElement;
      if (element) {
        queueMicrotask(() => (element.scrollTop = element.scrollHeight));
      }
    });
  }

  protected isNotice(message: ChatMessage): boolean {
    return message.role === 'assistant' && NOTICE_MESSAGES.has(message.text.trim());
  }

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.canSend()) {
      return;
    }
    this.questionSubmitted.emit(this.draft().trim());
    this.draft.set('');
  }

  protected suggest(question: string): void {
    if (!this.asking()) {
      this.questionSubmitted.emit(question);
    }
  }
}
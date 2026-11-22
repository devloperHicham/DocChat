import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BLOCKED_MESSAGE, ChatMessage, NOT_FOUND_MESSAGE } from '../../../core/models';
import { ChatPanel } from './chat-panel';

describe('ChatPanel', () => {
  let fixture: ComponentFixture<ChatPanel>;
  let host: HTMLElement;

  const setInputs = (inputs: { messages?: ChatMessage[]; asking?: boolean; suggestions?: string[] }) => {
    fixture.componentRef.setInput('messages', inputs.messages ?? []);
    fixture.componentRef.setInput('asking', inputs.asking ?? false);
    fixture.componentRef.setInput('suggestions', inputs.suggestions ?? []);
    fixture.detectChanges();
  };

  const type = (value: string) => {
    const input = host.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const sendButton = () => host.querySelector('button[type="submit"]') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ChatPanel] }).compileComponents();
    fixture = TestBed.createComponent(ChatPanel);
    host = fixture.nativeElement as HTMLElement;
  });

  it('shows a hint when there are no messages yet', () => {
    setInputs({});

    expect(host.textContent).toContain('Ask a question below');
  });

  it('renders the messages in order', () => {
    setInputs({
      messages: [
        { role: 'user', text: 'Question one' },
        { role: 'assistant', text: 'Answer one' },
      ],
    });

    const bubbles = Array.from(host.querySelectorAll('.bubble')).map(b => b.textContent?.trim());
    expect(bubbles).toEqual(['Question one', 'Answer one']);
  });

  it('styles the not-in-the-document and the blocked answers as notices', () => {
    setInputs({
      messages: [
        { role: 'assistant', text: NOT_FOUND_MESSAGE },
        { role: 'assistant', text: BLOCKED_MESSAGE },
      ],
    });

    expect(host.querySelectorAll('.bubble--notice').length).toBe(2);
  });

  it('shows a thinking indicator while the answer is still empty', () => {
    setInputs({ messages: [{ role: 'assistant', text: '' }], asking: true });

    expect(host.textContent).toContain('Thinking…');
  });

  it('shows suggestion chips and emits the chosen question', () => {
    setInputs({ suggestions: ['Summarize the document', 'What are the key points?'] });
    const emitted: string[] = [];
    fixture.componentInstance.questionSubmitted.subscribe(q => emitted.push(q));

    const chips = host.querySelectorAll('.chip');
    expect(chips.length).toBe(2);
    (chips[0] as HTMLButtonElement).click();

    expect(emitted).toEqual(['Summarize the document']);
  });

  it('hides the suggestions while an answer is running', () => {
    setInputs({ suggestions: ['Summarize the document'], asking: true });

    expect(host.querySelector('.chip')).toBeNull();
  });

  it('enables Send only when there is text and no answer is running', () => {
    setInputs({});
    expect(sendButton().disabled).toBe(true);

    type('What is pgvector?');
    expect(sendButton().disabled).toBe(false);

    fixture.componentRef.setInput('asking', true);
    fixture.detectChanges();
    expect(sendButton().disabled).toBe(true);
  });

  it('emits the trimmed question on submit and clears the field', () => {
    setInputs({});
    const emitted: string[] = [];
    fixture.componentInstance.questionSubmitted.subscribe(q => emitted.push(q));

    type('  What is pgvector?  ');
    (host.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual(['What is pgvector?']);
    expect((host.querySelector('input') as HTMLInputElement).value).toBe('');
  });
});
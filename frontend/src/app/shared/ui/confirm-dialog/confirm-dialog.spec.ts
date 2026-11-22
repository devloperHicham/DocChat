import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let host: HTMLElement;

  const setInputs = (open: boolean) => {
    fixture.componentRef.setInput('open', open);
    fixture.componentRef.setInput('title', 'Start a new document?');
    fixture.componentRef.setInput('message', 'Your conversation will be lost.');
    fixture.componentRef.setInput('detail', 'You will not be able to come back to it.');
    fixture.componentRef.setInput('confirmLabel', 'Yes, start new');
    fixture.componentRef.setInput('cancelLabel', 'No, keep chatting');
    fixture.detectChanges();
  };

  const buttons = () => Array.from(host.querySelectorAll('button')) as HTMLButtonElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialog] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialog);
    host = fixture.nativeElement as HTMLElement;
  });

  it('shows nothing while it is closed', () => {
    setInputs(false);

    expect(host.querySelector('dialog')).toBeNull();
  });

  it('shows the title, the message and the details when it is open', () => {
    setInputs(true);

    expect(host.querySelector('dialog')).not.toBeNull();
    expect(host.querySelector('#confirm-title')?.textContent).toContain('Start a new document?');
    expect(host.querySelector('#confirm-message')?.textContent).toContain('will be lost');
    expect(host.textContent).toContain('You will not be able to come back to it.');
  });

  it('offers the safe answer first and the destructive one second', () => {
    setInputs(true);

    expect(buttons().map(b => b.textContent?.trim())).toEqual(['No, keep chatting', 'Yes, start new']);
    expect(buttons()[0].hasAttribute('autofocus')).toBe(true);
    expect(buttons()[1].classList.contains('button--danger')).toBe(true);
  });

  it('emits "cancelled" for the No button', () => {
    setInputs(true);
    let cancelled = 0;
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);

    buttons()[0].click();

    expect(cancelled).toBe(1);
  });

  it('emits "confirmed" for the Yes button', () => {
    setInputs(true);
    let confirmed = 0;
    fixture.componentInstance.confirmed.subscribe(() => confirmed++);

    buttons()[1].click();

    expect(confirmed).toBe(1);
  });

  it('treats the Esc key as No and keeps the dialog under our control', () => {
    setInputs(true);
    let cancelled = 0;
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);
    const esc = new Event('cancel', { cancelable: true });

    (host.querySelector('dialog') as HTMLDialogElement).dispatchEvent(esc);

    expect(cancelled).toBe(1);
    expect(esc.defaultPrevented).toBe(true);
  });

  it('treats a click on the dark area as No, but not a click inside the box', () => {
    setInputs(true);
    let cancelled = 0;
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);

    (host.querySelector('.dialog__content') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(cancelled).toBe(0);

    (host.querySelector('dialog') as HTMLDialogElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(cancelled).toBe(1);
  });
});
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly detail = input('');
  readonly confirmLabel = input('Yes');
  readonly cancelLabel = input('No');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // The dialog only exists in the page while it is open.
    effect(() => {
      const element = this.dialog()?.nativeElement;
      if (element && !element.open) {
        // showModal() makes a real modal: focus stays inside, the page behind is inert, Esc is handled.
        if (typeof element.showModal === 'function') {
          element.showModal();
        } else {
          element.setAttribute('open', '');
        }
      }
    });
  }

  /** Esc key: the parent removes the dialog, so the browser must not close it by itself. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.cancelled.emit();
  }

  /** A click on the dark area around the box counts as "No". */
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelled.emit();
    }
  }
}
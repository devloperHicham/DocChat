import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-upload-screen',
  templateUrl: './upload-screen.html',
  styleUrl: './upload-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadScreen {
  readonly error = input('');
  readonly fileSelected = output<File>();

  protected readonly dragging = signal(false);

  protected onChange(event: Event): void {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
    element.value = ''; // lets the user pick the same file again
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { formatFileSize } from '../../../core/format';
import { ProcessingStep } from '../../../core/models';

@Component({
  selector: 'app-processing-screen',
  templateUrl: './processing-screen.html',
  styleUrl: './processing-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessingScreen {
  readonly fileName = input.required<string>();
  readonly fileSize = input(0);
  readonly step = input.required<ProcessingStep>();
  readonly cancelled = output<void>();

  protected readonly sizeLabel = computed(() => formatFileSize(this.fileSize()));
  protected readonly status = computed(() =>
    this.step() === 'indexing' ? 'Reading and indexing the document…' : 'Writing the summary…',
  );
}
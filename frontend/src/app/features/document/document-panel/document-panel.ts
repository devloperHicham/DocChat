import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { parseSummary } from '../../../core/summary';

@Component({
  selector: 'app-document-panel',
  templateUrl: './document-panel.html',
  styleUrl: './document-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentPanel {
  readonly fileName = input.required<string>();
  readonly chunks = input(0);
  readonly summary = input('');
  readonly summaryFailed = input(false);

  protected readonly parsed = computed(() => parseSummary(this.summary()));
}
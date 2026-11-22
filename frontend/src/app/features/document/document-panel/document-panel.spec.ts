import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentPanel } from './document-panel';

describe('DocumentPanel', () => {
  let fixture: ComponentFixture<DocumentPanel>;
  let host: HTMLElement;

  const setInputs = (inputs: { chunks?: number; summary?: string; summaryFailed?: boolean }) => {
    fixture.componentRef.setInput('fileName', 'report.pdf');
    fixture.componentRef.setInput('chunks', inputs.chunks ?? 2);
    fixture.componentRef.setInput('summary', inputs.summary ?? '');
    fixture.componentRef.setInput('summaryFailed', inputs.summaryFailed ?? false);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DocumentPanel] }).compileComponents();
    fixture = TestBed.createComponent(DocumentPanel);
    host = fixture.nativeElement as HTMLElement;
  });

  it('shows the file name and the passage count', () => {
    setInputs({ chunks: 2 });

    expect(host.textContent).toContain('report.pdf');
    expect(host.textContent).toContain('2 passages');
  });

  it('uses the singular for one passage', () => {
    setInputs({ chunks: 1 });

    expect(host.textContent).toContain('1 passage ');
  });

  it('shows the summary and its key points', () => {
    setInputs({ summary: 'A course.\n\nHere are the key points:\n\n* One\n* Two' });

    expect(host.querySelector('.text')?.textContent).toContain('A course.');
    const points = Array.from(host.querySelectorAll('.points li')).map(li => li.textContent?.trim());
    expect(points).toEqual(['One', 'Two']);
  });

  it('explains when the summary failed', () => {
    setInputs({ summaryFailed: true });

    expect(host.textContent).toContain('The summary could not be generated');
    expect(host.querySelector('.points')).toBeNull();
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingStep } from '../../../core/models';
import { ProcessingScreen } from './processing-screen';

describe('ProcessingScreen', () => {
  let fixture: ComponentFixture<ProcessingScreen>;
  let host: HTMLElement;

  const setStep = (step: ProcessingStep) => {
    fixture.componentRef.setInput('step', step);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProcessingScreen] }).compileComponents();
    fixture = TestBed.createComponent(ProcessingScreen);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('fileName', 'report.pdf');
    fixture.componentRef.setInput('fileSize', 1_258_291);
    setStep('indexing');
  });

  it('shows the file name and size', () => {
    expect(host.textContent).toContain('report.pdf');
    expect(host.textContent).toContain('1.2 MB');
  });

  it('marks the first step as current while indexing', () => {
    const steps = host.querySelectorAll('.step');

    expect(steps[0].classList.contains('step--current')).toBe(true);
    expect(steps[1].classList.contains('step--current')).toBe(false);
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Reading and indexing');
  });

  it('marks the first step as done while the summary is written', () => {
    setStep('summary');
    const steps = host.querySelectorAll('.step');

    expect(steps[0].classList.contains('step--done')).toBe(true);
    expect(steps[1].classList.contains('step--current')).toBe(true);
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Writing the summary');
  });

  it('emits when the user cancels', () => {
    let emitted = 0;
    fixture.componentInstance.cancelled.subscribe(() => emitted++);

    (host.querySelector('.cancel') as HTMLButtonElement).click();

    expect(emitted).toBe(1);
  });
});
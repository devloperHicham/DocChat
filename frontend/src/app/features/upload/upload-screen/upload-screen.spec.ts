import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadScreen } from './upload-screen';

describe('UploadScreen', () => {
  let fixture: ComponentFixture<UploadScreen>;
  let host: HTMLElement;
  const file = new File(['%PDF-1.7'], 'a.pdf', { type: 'application/pdf' });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UploadScreen] }).compileComponents();
    fixture = TestBed.createComponent(UploadScreen);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('invites the user to choose a PDF', () => {
    expect(host.textContent).toContain('Chat with your PDF');
    expect(host.querySelector('label[for="pdf-input"]')?.textContent).toContain('Choose a PDF');
  });

  it('emits the chosen file', () => {
    const emitted: File[] = [];
    fixture.componentInstance.fileSelected.subscribe(f => emitted.push(f));
    const input = host.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });

    input.dispatchEvent(new Event('change'));

    expect(emitted).toEqual([file]);
  });

  it('emits a dropped file', () => {
    const emitted: File[] = [];
    fixture.componentInstance.fileSelected.subscribe(f => emitted.push(f));
    const zone = host.querySelector('.dropzone') as HTMLElement;
    const drop = new Event('drop', { cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file] } });

    zone.dispatchEvent(drop);

    expect(emitted).toEqual([file]);
  });

  it('highlights the drop zone while a file is dragged over it', () => {
    const zone = host.querySelector('.dropzone') as HTMLElement;

    zone.dispatchEvent(new Event('dragover', { cancelable: true }));
    fixture.detectChanges();

    expect(zone.classList.contains('dropzone--active')).toBe(true);
  });

  it('shows an error message as an alert', () => {
    fixture.componentRef.setInput('error', 'Please choose a PDF file.');
    fixture.detectChanges();

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Please choose a PDF file.');
  });
});
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { WorkspaceStore } from './features/workspace/workspace-store';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  const makeReady = async (): Promise<ComponentFixture<App>> => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(WorkspaceStore).upload(new File(['%PDF-1.7'], 'report.pdf', { type: 'application/pdf' }));
    await fixture.whenStable();

    http.expectOne('/api/documents').flush({ documentId: 'id-1', filename: 'report.pdf', chunks: 2 });
    http.expectOne('/api/documents/id-1/summary').flush('{"t":"A short summary."}\n');
    await fixture.whenStable();
    return fixture;
  };

  it('starts with the header and the upload screen only', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h1')?.textContent).toContain('DocChat');
    expect(host.querySelector('app-upload-screen')).not.toBeNull();
    expect(host.querySelector('app-chat-panel')).toBeNull();
  });

  it('shows the summary and the chat once the analysis is complete', async () => {
    const fixture = await makeReady();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('app-document-panel')).not.toBeNull();
    expect(host.querySelector('app-chat-panel')).not.toBeNull();
    expect(host.textContent).toContain('A short summary.');
  });

  describe('New document', () => {
    const clickNewDocument = async (fixture: ComponentFixture<App>) => {
      (fixture.nativeElement.querySelector('app-header button') as HTMLButtonElement).click();
      await fixture.whenStable();
    };
    const dialogButtons = (fixture: ComponentFixture<App>) =>
      Array.from(fixture.nativeElement.querySelectorAll('app-confirm-dialog button')) as HTMLButtonElement[];

    it('warns the user and names the file before anything is lost', async () => {
      const fixture = await makeReady();

      await clickNewDocument(fixture);

      const dialog = (fixture.nativeElement as HTMLElement).querySelector('app-confirm-dialog');
      expect(dialog?.textContent).toContain('Start a new document?');
      expect(dialog?.textContent).toContain('report.pdf');
      expect(dialog?.textContent).toContain('will be lost');
    });

    it('keeps the conversation when the user answers No', async () => {
      const fixture = await makeReady();
      await clickNewDocument(fixture);

      dialogButtons(fixture)[0].click(); // "No, keep chatting"
      await fixture.whenStable();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.querySelector('app-confirm-dialog dialog')).toBeNull();
      expect(host.querySelector('app-chat-panel')).not.toBeNull();
      expect(host.textContent).toContain('A short summary.');
    });

    it('returns to the upload screen only when the user answers Yes', async () => {
      const fixture = await makeReady();
      await clickNewDocument(fixture);

      dialogButtons(fixture)[1].click(); // "Yes, start new"
      await fixture.whenStable();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.querySelector('app-upload-screen')).not.toBeNull();
      expect(host.querySelector('app-chat-panel')).toBeNull();
      expect(host.querySelector('app-confirm-dialog dialog')).toBeNull();
    });
  });
});
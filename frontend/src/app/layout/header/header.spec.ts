import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Header] }).compileComponents();
    fixture = TestBed.createComponent(Header);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('shows the product name as the page title', () => {
    expect(host.querySelector('h1')?.textContent).toContain('DocChat');
  });

  it('has no navigation and no language switch', () => {
    expect(host.querySelector('nav')).toBeNull();
    expect(host.querySelector('[aria-label="Language"]')).toBeNull();
  });

  it('hides the New document button by default', () => {
    expect(host.querySelector('button')).toBeNull();
  });

  it('shows the button when asked and emits on click', () => {
    let emitted = 0;
    fixture.componentInstance.newDocument.subscribe(() => emitted++);
    fixture.componentRef.setInput('showNewDocument', true);
    fixture.detectChanges();

    (host.querySelector('button') as HTMLButtonElement).click();

    expect(emitted).toBe(1);
  });
});
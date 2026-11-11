import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
} from '@angular/core';
import { Layout, ViewportService } from '../../core/viewport.service';
import { ShellHeaderComponent } from '../shell-header/shell-header';
import {
  ShellLogo,
  ShellNavComponent,
  ShellNavItem,
} from '../shell-nav/shell-nav';

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * The application frame: header across the top, navigation down the left, the
 * routed page in the remaining space.
 *
 * Responsive behaviour (breakpoints mirror Tailwind's defaults):
 * - desktop (>= 1024px): sidebar open, collapsible to an icon rail;
 * - tablet (601-1023px): starts as an icon rail, can be opened;
 * - phone (<= 600px): the sidebar is a drawer opened from the header.
 */
@Component({
  selector: 'lib-shell',
  imports: [ShellHeaderComponent, ShellNavComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Bound on the document: the scrim swallows clicks but never takes focus.
    '(document:keydown.escape)': 'closeDrawer()',
    '(keydown)': 'trapTab($event)',
  },
})
export class ShellComponent {
  private readonly document = inject(DOCUMENT);
  private readonly layout = inject(ViewportService).layout;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly navItems = input.required<readonly ShellNavItem[]>();
  readonly footerItems = input<readonly ShellNavItem[]>([]);
  readonly logo = input<ShellLogo | null>(null);
  readonly userName = input('');
  readonly userAvatarUrl = input<string | null>(null);
  readonly hasUnread = input(false);

  /** Icon rail rather than the full sidebar; follows the layout, and the user may override it. */
  protected readonly collapsed = linkedSignal(() => this.layout() === 'tablet');
  /** Phone drawer. Closes itself whenever the window leaves phone width. */
  protected readonly drawerOpen = linkedSignal<Layout, boolean>({
    source: this.layout,
    computation: (layout, previous) =>
      layout === 'phone' && (previous?.value ?? false),
  });

  protected toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  protected toggleDrawer(): void {
    if (this.drawerOpen()) this.closeDrawer();
    else this.openDrawer();
  }

  /** Closes the drawer and, unless the user is moving on, hands focus back to the menu button. */
  protected closeDrawer(restoreFocus = true): void {
    if (!this.drawerOpen()) return;
    this.drawerOpen.set(false);
    if (restoreFocus) this.focusAfterRender(() => this.menuButton());
  }

  /** Keeps Tab inside the header and the open drawer; the page behind is inert. */
  protected trapTab(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.drawerOpen()) return;
    const shift = event.shiftKey;
    const menu = this.menuButton();
    const focusables = this.navFocusables();
    const last = focusables[focusables.length - 1];
    const active = this.document.activeElement;

    if (!shift && active === last) {
      event.preventDefault();
      menu?.focus();
    } else if (shift && active === menu) {
      event.preventDefault();
      last?.focus();
    }
  }

  private openDrawer(): void {
    this.drawerOpen.set(true);
    this.focusAfterRender(() => this.navFocusables()[0] ?? null);
  }

  private focusAfterRender(target: () => HTMLElement | null): void {
    afterNextRender(() => target()?.focus(), { injector: this.injector });
  }

  private menuButton(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('.bar__menu');
  }

  private navFocusables(): HTMLElement[] {
    const nav = this.host.nativeElement.querySelector('.shell__nav');
    return Array.from(
      nav?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
    ).filter(
      // The collapse button is display:none on phones; `checkVisibility` is absent in jsdom.
      (el) => el.checkVisibility?.({ visibilityProperty: true }) ?? true,
    );
  }
}

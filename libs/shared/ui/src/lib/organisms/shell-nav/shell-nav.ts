import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent, IconName } from '../../atoms/icon/icon';

export interface ShellNavItem {
  id: string;
  /** i18n key for the visible label. */
  labelKey: string;
  icon: IconName;
  /**
   * Router link. An item without one renders as unavailable — used for pages the
   * design shows but that are not built yet.
   */
  route?: string;
  /** Count shown as a badge; hidden when 0 or absent. */
  badge?: number;
  /** Match only the exact URL (needed for `/`, which prefixes every route). */
  exact?: boolean;
}

export interface ShellLogo {
  url: string;
  alt: string;
}

/** One workspace (tenant) offered by the switcher under the active tenant. */
export interface WorkspaceItem {
  id: string;
  label: string;
  logoUrl?: string;
  active?: boolean;
}

/**
 * The shell's left navigation: the app's destinations, a workspace switcher,
 * a tagline, support links and the platform mark.
 *
 * Presentational — the app supplies the items, the workspaces and the brand
 * copy, so the shell never imports a feature. Collapsed, it becomes an icon
 * rail with the label under each icon.
 */
@Component({
  selector: 'lib-shell-nav',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    IconComponent,
  ],
  templateUrl: './shell-nav.html',
  styleUrl: './shell-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.collapsed]': 'collapsed()' },
})
export class ShellNavComponent {
  readonly items = input.required<readonly ShellNavItem[]>();
  readonly footerItems = input<readonly ShellNavItem[]>([]);
  readonly collapsed = input(false);
  /** The user's workspaces; the active one is highlighted. Empty = no switcher. */
  readonly workspaces = input<readonly WorkspaceItem[]>([]);
  readonly tagline = input<string | null>(null);
  readonly taglineSub = input<string | null>(null);
  /** The platform behind every brand ("Powered by ..."), not the brand's logo. */
  readonly platformLogo = input<ShellLogo | null>(null);

  readonly collapseToggled = output<void>();
  /** Fired when a destination is chosen, so a drawer can close itself. */
  readonly navigated = output<void>();
  /** Fired when the user picks another workspace from the switcher. */
  readonly workspaceSelected = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The workspace shown on the trigger: the active one, or the first. */
  protected readonly activeWorkspace = computed(
    () => this.workspaces().find((ws) => ws.active) ?? this.workspaces()[0] ?? null,
  );
  protected readonly switcherOpen = signal(false);

  protected toggleSwitcher(): void {
    this.switcherOpen.update((value) => !value);
  }

  protected selectWorkspace(id: string): void {
    this.switcherOpen.set(false);
    this.workspaceSelected.emit(id);
  }

  /** Clicking anywhere outside the switcher closes it. */
  protected onDocClick(event: MouseEvent): void {
    if (this.switcherOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.switcherOpen.set(false);
    }
  }
}

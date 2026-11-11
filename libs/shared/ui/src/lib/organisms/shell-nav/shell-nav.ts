import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
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

/**
 * The shell's left navigation: the app's destinations, the brand's own space,
 * a tagline, support links and the platform mark.
 *
 * Presentational — the app supplies the items and the brand copy, so the shell
 * never imports a feature. Collapsed, it becomes an icon rail with the label
 * under each icon.
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
  /** The brand's own space, e.g. "Our Solstice". */
  readonly tenantLabel = input<string | null>(null);
  readonly tagline = input<string | null>(null);
  readonly taglineSub = input<string | null>(null);
  /** The platform behind every brand ("Powered by ..."), not the brand's logo. */
  readonly platformLogo = input<ShellLogo | null>(null);

  readonly collapseToggled = output<void>();
  /** Fired when a destination is chosen, so a drawer can close itself. */
  readonly navigated = output<void>();
}

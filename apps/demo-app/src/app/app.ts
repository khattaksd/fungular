import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BrandThemeService } from '@libs/theme';
import { ShellComponent } from '@libs/ui';
import { SessionStore } from '@libs/session';
import {
  FOOTER_ITEMS,
  NAV_ITEMS,
  PLATFORM_LOGO,
} from './core/shell/shell.config';

@Component({
  imports: [RouterModule, ShellComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
})
export class App {
  private readonly session = inject(SessionStore);
  private readonly brandService = inject(BrandThemeService);
  private readonly router = inject(Router);

  protected readonly navItems = NAV_ITEMS;
  protected readonly footerItems = FOOTER_ITEMS;
  protected readonly platformLogo = PLATFORM_LOGO;
  protected readonly brand = this.brandService.theme;

  /** The signed-in user's display name, or an empty string while signed out. */
  protected readonly userName = computed(() => this.session.user()?.name ?? '');

  /**
   * Workspaces for the sidebar switcher: the user's tenants, with the active
   * one flagged so the shell can highlight it.
   */
  protected readonly workspaces = computed(() =>
    this.session.tenants().map((tenant) => ({
      id: tenant.id,
      label: tenant.name,
      logoUrl: tenant.logo,
      active: tenant.id === this.session.currentTenant()?.id,
    })),
  );

  constructor() {
    // Tenant selection IS brand theming: the demo tenants are the demo brands,
    // applied at login and on every workspace switch.
    effect(() => {
      const tenant = this.session.currentTenant();
      if (tenant) void this.brandService.applyBrand(tenant.id);
    });
  }

  /** Switches workspace from the sidebar switcher and reloads tenant data. */
  protected onWorkspaceSelected(tenantId: string): void {
    this.session.chooseTenant(tenantId);
    void this.router.navigateByUrl('/');
  }
}
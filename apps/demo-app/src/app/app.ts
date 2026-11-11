import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrandThemeService } from '@libs/theme';
import { ShellComponent } from '@libs/ui';
import {
  DEMO_USER,
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
  protected title = 'fungular';

  protected readonly brand = inject(BrandThemeService).theme;
  protected readonly navItems = NAV_ITEMS;
  protected readonly footerItems = FOOTER_ITEMS;
  protected readonly platformLogo = PLATFORM_LOGO;
  protected readonly user = DEMO_USER;
}

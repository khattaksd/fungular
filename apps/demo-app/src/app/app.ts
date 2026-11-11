import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ShellComponent } from '@libs/ui';
import { DEMO_USER, FOOTER_ITEMS, NAV_ITEMS } from './core/shell/shell.config';

@Component({
  imports: [RouterModule, ShellComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
})
export class App {
  protected title = 'fungular';

  protected readonly navItems = NAV_ITEMS;
  protected readonly footerItems = FOOTER_ITEMS;
  protected readonly user = DEMO_USER;
}

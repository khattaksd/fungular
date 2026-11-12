import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SessionStore } from '../../+state/session.store';

@Component({
  selector: 'lib-workspaces',
  imports: [TranslatePipe],
  templateUrl: './workspaces.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacesPage {
  private readonly store = inject(SessionStore);
  private readonly router = inject(Router);

  protected readonly tenants = computed(() => this.store.auth()?.tenants ?? []);
  protected readonly user = this.store.user;

  constructor() {
    // A single-tenant user should never land here.
    effect(() => {
      if (!this.store.isAuthenticated()) {
        void this.router.navigateByUrl('/login');
      } else if (!this.store.hasMultipleTenants() && this.store.currentTenant()) {
        void this.router.navigateByUrl('/');
      }
    });
  }

  protected choose(tenantId: string): void {
    this.store.chooseTenant(tenantId);
    void this.router.navigateByUrl('/');
  }

  protected logout(): void {
    this.store.logout();
    void this.router.navigateByUrl('/login');
  }
}

import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '@libs/ui';
import { SessionStore } from '../../+state/session.store';

@Component({
  selector: 'lib-login',
  imports: [FormsModule, TranslatePipe, ButtonComponent],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly store = inject(SessionStore);
  private readonly router = inject(Router);

  protected readonly loading = this.store.loading;
  protected readonly errorMessage = this.store.errorMessage;

  protected email = '';
  protected password = '';
  private readonly submitted = signal(false);

  constructor() {
    // Once login succeeds, take the user to the workspace chooser when they
    // belong to several tenants, or straight into the app otherwise.
    effect(() => {
      if (!this.submitted() || !this.store.isAuthenticated()) return;
      this.submitted.set(false);
      const route = this.store.hasMultipleTenants() ? '/workspaces' : '/';
      void this.router.navigateByUrl(route);
    });
  }

  protected onSubmit(): void {
    if (!this.email.includes('@') || !this.password) return;
    this.submitted.set(true);
    this.store.login({ email: this.email, password: this.password });
  }
}

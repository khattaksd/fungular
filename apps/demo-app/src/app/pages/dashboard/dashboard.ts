import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BadgeComponent, ProgressComponent } from '@libs/ui';
import { SessionStore } from '@libs/session';
import {
  DashboardData,
  DashboardService,
} from '../../core/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, TranslatePipe, BadgeComponent, ProgressComponent],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly service = inject(DashboardService);
  protected readonly session = inject(SessionStore);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly data = signal<DashboardData | null>(null);

  /** Warm greeting scoped to what the clock actually reads. */
  protected readonly greetingKey = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'DASHBOARD.GREETING_MORNING';
    if (hour < 18) return 'DASHBOARD.GREETING_AFTERNOON';
    return 'DASHBOARD.GREETING_EVENING';
  });

  constructor() {
    // Reload whenever the tenant changes: switching workspaces while already on
    // the dashboard is a same-URL navigation, so the router never recreates this
    // page — the effect is the reliable trigger.
    effect(() => {
      this.session.currentTenant();
      void this.load();
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.fetch().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err: { message?: string }) => {
        this.error.set(err.message ?? 'Could not load the dashboard');
        this.loading.set(false);
      },
    });
  }
}

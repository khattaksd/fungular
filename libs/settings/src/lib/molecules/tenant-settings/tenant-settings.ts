import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ANALYTICS } from '@libs/analytics';
import { ButtonComponent } from '@libs/ui';
import { IGenericError } from '@libs/entity';
import { firstValueFrom } from 'rxjs';
import { TenantSettingsService } from '../../services/tenant-settings/tenant-settings.service';

/**
 * The tenant panel in Settings. The one async exception in the settings
 * feature — tenant identity lives on the API, unlike the local preferences
 * the rest of this feature is built to showcase.
 */
@Component({
  selector: 'lib-tenant-settings',
  imports: [FormsModule, TranslatePipe, ButtonComponent],
  templateUrl: './tenant-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantSettingsComponent {
  private readonly service = inject(TenantSettingsService);
  private readonly analytics = inject(ANALYTICS);

  protected readonly name = signal('');
  protected readonly domain = signal('');
  protected readonly logo = signal('');
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly error = signal<IGenericError | null>(null);

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    try {
      const settings = await firstValueFrom(this.service.fetch());
      this.name.set(settings.name);
      this.logo.set(settings.logo);
      this.domain.set(settings.domain);
    } catch {
      this.error.set({
        message: 'Could not load tenant settings',
        code: '',
        status: 0,
      });
    }
  }

  protected save(): void {
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);
    this.service.update({ name: this.name() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.analytics.logEvent('tenant_settings_saved');
      },
      error: (err: IGenericError) => {
        this.saving.set(false);
        this.error.set(err);
      },
    });
  }

  /** Fake upload: ask the mock, show whatever URL it returns. */
  protected uploadLogo(): void {
    this.service.uploadLogo().subscribe({
      next: (result) => {
        this.logo.set(result.url);
        this.analytics.logEvent('tenant_logo_uploaded');
      },
      error: (err: IGenericError) => this.error.set(err),
    });
  }
}

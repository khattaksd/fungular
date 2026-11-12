import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BadgeComponent, ProgressComponent } from '@libs/ui';
import { BillingStore } from '../../+state/billing.store';

@Component({
  selector: 'lib-billing',
  imports: [TranslatePipe, ProgressComponent, BadgeComponent],
  templateUrl: './billing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingPage {
  protected readonly store = inject(BillingStore);

  constructor() {
    this.store.fetchBilling();
  }
}

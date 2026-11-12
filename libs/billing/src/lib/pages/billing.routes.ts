import { Routes } from '@angular/router';
import { BillingStore } from '../+state/billing.store';
import { BillingService } from '../services/billing/billing.service';
import { BillingPage } from './billing/billing';

export const billingRoutes: Routes = [
  {
    path: '',
    providers: [BillingStore, BillingService],
    component: BillingPage,
  },
];

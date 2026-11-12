import { computed, inject } from '@angular/core';
import { IGenericError } from '@libs/entity';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { BillingInfo } from '../models/billing.model';
import { BillingService } from '../services/billing/billing.service';

export interface BillingState {
  info: BillingInfo | null;
  loading: boolean;
  error: IGenericError | null;
}

export const initialBillingState: BillingState = {
  info: null,
  loading: false,
  error: null,
};

/** Plan, usage and invoices for the active tenant. Provided on the billing route. */
export const BillingStore = signalStore(
  withState(initialBillingState),
  withComputed(({ info, error }) => ({
    errorMessage: computed(() => error()?.message ?? null),
  })),
  withMethods((store, service = inject(BillingService)) => ({
    fetchBilling: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          service.fetch().pipe(
            tapResponse({
              next: (info) => patchState(store, { info, loading: false }),
              error: (error: IGenericError) =>
                patchState(store, { error, loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

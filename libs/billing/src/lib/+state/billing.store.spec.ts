import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { BillingService } from '../services/billing/billing.service';
import { BillingStore } from './billing.store';

const BILLING = { plan: 'Scale', price: '$19 / seat', seats: 5, usage: [{ label: 'Seats', pct: 100 }], invoices: [] } as never;

describe('BillingStore', () => {
  let service: { fetch: Mock };
  const setup = () => {
    service = { fetch: vi.fn() };
    TestBed.configureTestingModule({
      providers: [BillingStore, { provide: BillingService, useValue: service }],
    });
    return TestBed.inject(BillingStore);
  };

  it('loads the billing info', () => {
    const store = setup();
    service.fetch.mockReturnValue(of(BILLING));
    store.fetchBilling();
    expect(store.info()?.plan).toBe('Scale');
    expect(store.loading()).toBe(false);
  });

  it('keeps errors', () => {
    const store = setup();
    service.fetch.mockReturnValue(throwError(() => ({ message: 'boom', code: 'E', status: 500 })));
    store.fetchBilling();
    expect(store.error()?.message).toBe('boom');
  });
});

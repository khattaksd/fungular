import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BillingService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BillingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches the billing payload', () => {
    let plan = '';
    service.fetch().subscribe((info) => (plan = info.plan));
    http.expectOne('/api/billing').flush({ plan: 'Growth', price: '$24', seats: 5, usage: [], invoices: [] });
    expect(plan).toBe('Growth');
  });
});

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@libs/environment';
import { Observable } from 'rxjs';
import { BillingInfo } from '../../models/billing.model';

@Injectable()
export class BillingService {
  httpClient = inject(HttpClient);

  fetch(): Observable<BillingInfo> {
    return this.httpClient.get<BillingInfo>(environment.baseUrl + '/api/billing');
  }
}

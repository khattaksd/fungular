import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@libs/environment';
import { Observable } from 'rxjs';
import {
  LogoUploadResult,
  TenantSettings,
} from '../../models/tenant-settings.model';

@Injectable()
export class TenantSettingsService {
  httpClient = inject(HttpClient);

  fetch(): Observable<TenantSettings> {
    return this.httpClient.get<TenantSettings>(
      environment.baseUrl + '/api/settings',
    );
  }

  /** Updates the mock tenant settings; the API echoes the merged result. */
  update(patch: { name?: string; domain?: string }): Observable<TenantSettings> {
    return this.httpClient.patch<TenantSettings>(
      environment.baseUrl + '/api/settings',
      patch,
    );
  }

  /** Fake upload: the mock answers with the tenant's existing logo. */
  uploadLogo(): Observable<LogoUploadResult> {
    return this.httpClient.post<LogoUploadResult>(
      environment.baseUrl + '/api/settings/logo',
      {},
    );
  }
}
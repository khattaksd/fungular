import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@libs/environment';
import { Observable } from 'rxjs';
import { AuthResponse } from '../../models/session.model';

/** Root-scoped like the store: the interceptor and guard may need it first. */
@Injectable({ providedIn: 'root' })
export class SessionService {
  httpClient = inject(HttpClient);

  /** Fake login — the mock API answers any well-formed email + password. */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(
      environment.baseUrl + '/api/auth/login',
      { email, password },
    );
  }
}

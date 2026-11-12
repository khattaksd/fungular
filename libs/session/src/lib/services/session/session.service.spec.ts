import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts credentials and returns the auth payload', () => {
    let token = '';
    service.login('alex@example.com', 'pw').subscribe((auth) => (token = auth.token));

    const request = http.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'alex@example.com', password: 'pw' });
    request.flush({ token: 'tok', user: { id: 'u', name: 'Alex', email: 'alex@example.com' }, tenants: [] });

    expect(token).toBe('tok');
  });
});

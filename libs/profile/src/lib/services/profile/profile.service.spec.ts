import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let http: HttpTestingController;

  const setup = (): void => {
    TestBed.configureTestingModule({
      providers: [ProfileService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    http = TestBed.inject(HttpTestingController);
  };

  afterEach(() => http.verify());

  it('reads the profile contract', () => {
    setup();
    let id = '';
    service.fetchProfile().subscribe((user) => (id = user.id));

    http
      .expectOne('/api/v1/profile')
      .flush({ data: { id: 'u-alex', name: 'Alex Rivera' } });

    expect(id).toBe('u-alex');
  });
});

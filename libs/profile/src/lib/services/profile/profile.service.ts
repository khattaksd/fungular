import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@libs/entity';
import { commonPaths, environment } from '@libs/environment';
import { map, Observable } from 'rxjs';

@Injectable()
export class ProfileService {
  httpClient = inject(HttpClient);

  /**
   * Reads the `{ data: User }` profile contract. The mock API serves it today;
   * a real backend implementing the same contract slots in without changes.
   */
  fetchProfile(): Observable<User> {
    return this.httpClient
      .get<{ data: User }>(environment.baseUrl + commonPaths.profile.current)
      .pipe(map(({ data }) => data));
  }
}

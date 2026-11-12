import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@libs/environment';
import { map, Observable } from 'rxjs';
import { Member } from '../../models/team.model';

@Injectable()
export class TeamService {
  httpClient = inject(HttpClient);

  list(): Observable<Member[]> {
    return this.httpClient
      .get<{ members: Member[] }>(environment.baseUrl + '/api/team')
      .pipe(map(({ members }) => members));
  }
}

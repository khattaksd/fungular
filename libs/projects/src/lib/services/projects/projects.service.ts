import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@libs/environment';
import { map, Observable } from 'rxjs';
import { Project } from '@libs/entity';
import { ProjectDetail } from '../../models/project.model';

@Injectable()
export class ProjectsService {
  httpClient = inject(HttpClient);

  list(): Observable<Project[]> {
    return this.httpClient
      .get<{ projects: Project[] }>(environment.baseUrl + '/api/projects')
      .pipe(map(({ projects }) => projects));
  }

  get(id: string): Observable<ProjectDetail> {
    return this.httpClient.get<ProjectDetail>(
      environment.baseUrl + `/api/projects/${id}`,
    );
  }
}

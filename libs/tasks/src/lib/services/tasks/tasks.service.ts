import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@libs/environment';
import { map, Observable } from 'rxjs';
import { Task } from '../../models/task.model';

@Injectable()
export class TasksService {
  httpClient = inject(HttpClient);

  list(): Observable<Task[]> {
    return this.httpClient
      .get<{ tasks: Task[] }>(environment.baseUrl + '/api/tasks')
      .pipe(map(({ tasks }) => tasks));
  }
}

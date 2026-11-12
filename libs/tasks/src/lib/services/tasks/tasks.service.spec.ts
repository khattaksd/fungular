import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TasksService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TasksService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('returns the tenant’s tasks', () => {
    let count = 0;
    service.list().subscribe((tasks) => (count = tasks.length));
    http.expectOne('/api/tasks').flush({ tasks: [{ id: 't1' }, { id: 't2' }] });
    expect(count).toBe(2);
  });
});

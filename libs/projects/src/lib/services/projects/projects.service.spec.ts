import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjectsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists projects', () => {
    let count = 0;
    service.list().subscribe((projects) => (count = projects.length));
    http.expectOne('/api/projects').flush({ projects: [{ id: 'p1' }, { id: 'p2' }] });
    expect(count).toBe(2);
  });

  it('fetches one project with its tasks and members', () => {
    let id = '';
    service.get('p1').subscribe((detail) => (id = detail.project.id));
    http.expectOne('/api/projects/p1').flush({ project: { id: 'p1' }, tasks: [], members: [] });
    expect(id).toBe('p1');
  });
});

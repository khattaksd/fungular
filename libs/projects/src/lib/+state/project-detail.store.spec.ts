import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { ProjectsService } from '../services/projects/projects.service';
import { ProjectDetailStore } from './project-detail.store';

const DETAIL = {
  project: { id: 'p1', name: 'Rise 2.0', description: 'd', status: 'active', progress: 72, due: 'x', lead: 'u-1', members: ['u-1'], tasks: { total: 4, done: 2 } },
  tasks: [{ id: 't1', title: 'Sketch', projectId: 'p1', assignee: 'u-2', status: 'todo', priority: 'high', due: 'x' }],
  members: [{ id: 'u-1', name: 'Alex', email: 'a@x.dev', role: 'Admin', status: 'active' }],
} as never;

describe('ProjectDetailStore', () => {
  let service: { get: Mock };
  const setup = () => {
    service = { get: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProjectDetailStore, { provide: ProjectsService, useValue: service }],
    });
    return TestBed.inject(ProjectDetailStore);
  };

  it('loads a project by id', () => {
    const store = setup();
    service.get.mockReturnValue(of(DETAIL));
    store.fetchProject('p1');
    expect(store.project()?.name).toBe('Rise 2.0');
    expect(store.detail()?.tasks).toHaveLength(1);
  });

  it('reports failures', () => {
    const store = setup();
    service.get.mockReturnValue(throwError(() => ({ message: 'nope', code: 'E', status: 404 })));
    store.fetchProject('nope');
    expect(store.error()?.message).toBe('nope');
  });
});

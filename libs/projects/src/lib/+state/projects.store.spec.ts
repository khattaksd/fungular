import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { ProjectsService } from '../services/projects/projects.service';
import { ProjectsStore } from './projects.store';

const PROJECTS = [
  { id: 'p1', name: 'Rise 2.0', description: 'd', status: 'active', progress: 72, due: '2026-12-04', lead: 'u-1', members: ['u-1'], tasks: { total: 4, done: 2 } },
  { id: 'p2', name: 'Ember', description: 'd', status: 'on-hold', progress: 30, due: '2026-12-18', lead: 'u-2', members: ['u-2'], tasks: { total: 2, done: 1 } },
] as never;

describe('ProjectsStore', () => {
  let service: { list: Mock };

  const setup = () => {
    service = { list: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProjectsStore, { provide: ProjectsService, useValue: service }],
    });
    return TestBed.inject(ProjectsStore);
  };

  it('starts empty', () => {
    const store = setup();
    expect(store.projects()).toEqual([]);
    expect(store.activeCount()).toBe(0);
  });

  it('loads the tenant’s projects and counts the active ones', () => {
    const store = setup();
    service.list.mockReturnValue(of(PROJECTS));
    store.fetchProjects();
    expect(store.projects()).toHaveLength(2);
    expect(store.activeCount()).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('keeps the error message on failure', () => {
    const store = setup();
    service.list.mockReturnValue(throwError(() => ({ message: 'boom', code: 'E', status: 500 })));
    store.fetchProjects();
    expect(store.error()?.message).toBe('boom');
  });
});

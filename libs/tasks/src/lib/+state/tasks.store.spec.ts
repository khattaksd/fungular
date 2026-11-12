import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { TasksService } from '../services/tasks/tasks.service';
import { TasksStore } from './tasks.store';

const TASKS = [
  { id: 't1', title: 'Sketch the flow', projectId: 'p1', assignee: 'u-1', status: 'done', priority: 'high', due: 'x' },
  { id: 't2', title: 'Audit taxonomy', projectId: 'p2', assignee: 'u-2', status: 'in_progress', priority: 'medium', due: 'x' },
  { id: 't3', title: 'Write copy', projectId: 'p1', assignee: 'u-3', status: 'todo', priority: 'low', due: 'x' },
] as never;

describe('TasksStore', () => {
  let service: { list: Mock };
  const setup = () => {
    service = { list: vi.fn() };
    TestBed.configureTestingModule({
      providers: [TasksStore, { provide: TasksService, useValue: service }],
    });
    return TestBed.inject(TasksStore);
  };

  it('loads tasks and filters by status, priority and search', () => {
    const store = setup();
    service.list.mockReturnValue(of(TASKS));
    store.fetchTasks();
    expect(store.tasks()).toHaveLength(3);

    store.setStatusFilter('done');
    expect(store.filtered()).toHaveLength(1);

    store.setStatusFilter('all');
    store.setPriorityFilter('medium');
    expect(store.filtered().map((t) => t.id)).toEqual(['t2']);

    store.setPriorityFilter('all');
    store.setSearch('copy');
    expect(store.filtered().map((t) => t.id)).toEqual(['t3']);
  });

  it('keeps errors', () => {
    const store = setup();
    service.list.mockReturnValue(throwError(() => ({ message: 'boom', code: 'E', status: 500 })));
    store.fetchTasks();
    expect(store.error()?.message).toBe('boom');
  });
});

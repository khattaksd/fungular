import { computed, inject } from '@angular/core';
import { IGenericError } from '@libs/entity';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { TasksService } from '../services/tasks/tasks.service';

export type TaskStatusFilter = 'all' | TaskStatus;
export type TaskPriorityFilter = 'all' | TaskPriority;

export interface TasksState {
  tasks: Task[];
  statusFilter: TaskStatusFilter;
  priorityFilter: TaskPriorityFilter;
  search: string;
  loading: boolean;
  error: IGenericError | null;
}

export const initialTasksState: TasksState = {
  tasks: [],
  statusFilter: 'all',
  priorityFilter: 'all',
  search: '',
  loading: false,
  error: null,
};

/**
 * All tasks for the active tenant, filtered client-side (the mock API returns
 * the whole tenant's set). Filters are plain state so `filtered` recomputes.
 */
export const TasksStore = signalStore(
  withState(initialTasksState),
  withComputed(({ tasks, statusFilter, priorityFilter, search, error }) => ({
    filtered: computed(() => {
      const query = search().trim().toLowerCase();
      return tasks().filter((task) => {
        if (statusFilter() !== 'all' && task.status !== statusFilter()) return false;
        if (priorityFilter() !== 'all' && task.priority !== priorityFilter()) return false;
        if (query && !task.title.toLowerCase().includes(query)) return false;
        return true;
      });
    }),
    errorMessage: computed(() => error()?.message ?? null),
  })),
  withMethods((store, service = inject(TasksService)) => ({
    fetchTasks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          service.list().pipe(
            tapResponse({
              next: (tasks) => patchState(store, { tasks, loading: false }),
              error: (error: IGenericError) =>
                patchState(store, { error, loading: false }),
            }),
          ),
        ),
      ),
    ),
    setStatusFilter(filter: TaskStatusFilter): void {
      patchState(store, { statusFilter: filter });
    },
    setPriorityFilter(filter: TaskPriorityFilter): void {
      patchState(store, { priorityFilter: filter });
    },
    setSearch(query: string): void {
      patchState(store, { search: query });
    },
  })),
);

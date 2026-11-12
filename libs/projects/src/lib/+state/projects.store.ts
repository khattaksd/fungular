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
import { Project } from '@libs/entity';
import { ProjectsService } from '../services/projects/projects.service';

export interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: IGenericError | null;
}

export const initialProjectsState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
};

/** Project list for the active tenant. Provided on the projects route. */
export const ProjectsStore = signalStore(
  withState(initialProjectsState),
  withComputed(({ projects, error }) => ({
    activeCount: computed(() => projects().filter((p) => p.status === 'active').length),
    errorMessage: computed(() => error()?.message ?? null),
  })),
  withMethods((store, service = inject(ProjectsService)) => ({
    fetchProjects: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          service.list().pipe(
            tapResponse({
              next: (projects) => patchState(store, { projects, loading: false }),
              error: (error: IGenericError) =>
                patchState(store, { error, loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

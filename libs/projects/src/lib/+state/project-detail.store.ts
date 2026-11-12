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
import { ProjectDetail } from '../models/project.model';
import { ProjectsService } from '../services/projects/projects.service';

export interface ProjectDetailState {
  detail: ProjectDetail | null;
  loading: boolean;
  error: IGenericError | null;
}

export const initialProjectDetailState: ProjectDetailState = {
  detail: null,
  loading: false,
  error: null,
};

/** One project's tasks and members. Provided on the `:id` route. */
export const ProjectDetailStore = signalStore(
  withState(initialProjectDetailState),
  withComputed(({ detail, error }) => ({
    project: computed(() => detail()?.project ?? null),
    errorMessage: computed(() => error()?.message ?? null),
  })),
  withMethods((store, service = inject(ProjectsService)) => ({
    fetchProject: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          service.get(id).pipe(
            tapResponse({
              next: (detail) => patchState(store, { detail, loading: false }),
              error: (error: IGenericError) =>
                patchState(store, { error, loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

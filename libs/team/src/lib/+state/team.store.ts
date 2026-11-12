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
import { Member } from '../models/team.model';
import { TeamService } from '../services/team/team.service';

export interface TeamState {
  members: Member[];
  loading: boolean;
  error: IGenericError | null;
}

export const initialTeamState: TeamState = {
  members: [],
  loading: false,
  error: null,
};

/** The active tenant's roster. Provided on the team route. */
export const TeamStore = signalStore(
  withState(initialTeamState),
  withComputed(({ members, error }) => ({
    activeCount: computed(() => members().filter((m) => m.status === 'active').length),
    errorMessage: computed(() => error()?.message ?? null),
  })),
  withMethods((store, service = inject(TeamService)) => ({
    fetchTeam: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          service.list().pipe(
            tapResponse({
              next: (members) => patchState(store, { members, loading: false }),
              error: (error: IGenericError) =>
                patchState(store, { error, loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

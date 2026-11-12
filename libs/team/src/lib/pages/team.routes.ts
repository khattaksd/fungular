import { Routes } from '@angular/router';
import { TeamStore } from '../+state/team.store';
import { TeamService } from '../services/team/team.service';
import { TeamPage } from './team/team';

export const teamRoutes: Routes = [
  {
    path: '',
    providers: [TeamStore, TeamService],
    component: TeamPage,
  },
];

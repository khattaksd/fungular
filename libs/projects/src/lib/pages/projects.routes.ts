import { Routes } from '@angular/router';
import { ProjectsStore } from '../+state/projects.store';
import { ProjectDetailStore } from '../+state/project-detail.store';
import { ProjectsService } from '../services/projects/projects.service';
import { ProjectDetailPage } from './project-detail/project-detail';
import { ProjectsPage } from './projects/projects';

export const projectsRoutes: Routes = [
  {
    path: '',
    providers: [ProjectsStore, ProjectsService],
    component: ProjectsPage,
  },
  {
    path: ':id',
    providers: [ProjectDetailStore, ProjectsService],
    component: ProjectDetailPage,
  },
];

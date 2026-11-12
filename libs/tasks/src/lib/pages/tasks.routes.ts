import { Routes } from '@angular/router';
import { TasksStore } from '../+state/tasks.store';
import { TasksService } from '../services/tasks/tasks.service';
import { TasksPage } from './tasks/tasks';

export const tasksRoutes: Routes = [
  {
    path: '',
    providers: [TasksStore, TasksService],
    component: TasksPage,
  },
];

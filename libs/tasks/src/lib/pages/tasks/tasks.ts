import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BadgeComponent } from '@libs/ui';
import { TasksStore } from '../../+state/tasks.store';
import { TaskPriorityFilter, TaskStatusFilter } from '../../+state/tasks.store';

@Component({
  selector: 'lib-tasks',
  imports: [RouterLink, TranslatePipe, BadgeComponent],
  templateUrl: './tasks.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  protected readonly store = inject(TasksStore);

  protected readonly statusOptions: { value: TaskStatusFilter; labelKey: string }[] = [
    { value: 'all', labelKey: 'TASKS.FILTER_ALL' },
    { value: 'todo', labelKey: 'TASKS.FILTER_TODO' },
    { value: 'in_progress', labelKey: 'TASKS.FILTER_IN_PROGRESS' },
    { value: 'done', labelKey: 'TASKS.FILTER_DONE' },
  ];

  protected readonly priorityOptions: { value: TaskPriorityFilter; labelKey: string }[] = [
    { value: 'all', labelKey: 'TASKS.PRIORITY_ALL' },
    { value: 'high', labelKey: 'TASKS.PRIORITY_HIGH' },
    { value: 'medium', labelKey: 'TASKS.PRIORITY_MEDIUM' },
    { value: 'low', labelKey: 'TASKS.PRIORITY_LOW' },
  ];

  constructor() {
    this.store.fetchTasks();
  }

  protected onSearch(event: Event): void {
    this.store.setSearch((event.target as HTMLInputElement).value);
  }
}

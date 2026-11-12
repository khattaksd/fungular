import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProgressComponent } from '@libs/ui';
import { BadgeComponent } from '@libs/ui';
import { ProjectsStore } from '../../+state/projects.store';

@Component({
  selector: 'lib-projects',
  imports: [RouterLink, TranslatePipe, ProgressComponent, BadgeComponent],
  templateUrl: './projects.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPage {
  protected readonly store = inject(ProjectsStore);

  constructor() {
    this.store.fetchProjects();
  }
}

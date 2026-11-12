import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AvatarComponent, BadgeComponent, ProgressComponent } from '@libs/ui';
import { ProjectDetailStore } from '../../+state/project-detail.store';

@Component({
  selector: 'lib-project-detail',
  imports: [RouterLink, TranslatePipe, BadgeComponent, ProgressComponent, AvatarComponent],
  templateUrl: './project-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailPage {
  /** Route param via `withComponentInputBinding()`. */
  readonly id = input<string>('');

  protected readonly store = inject(ProjectDetailStore);

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.store.fetchProject(id);
    });
  }
}

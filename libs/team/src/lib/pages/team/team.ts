import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AvatarComponent, BadgeComponent } from '@libs/ui';
import { MemberRole } from '../../models/team.model';
import { TeamStore } from '../../+state/team.store';

@Component({
  selector: 'lib-team',
  imports: [TranslatePipe, AvatarComponent, BadgeComponent],
  templateUrl: './team.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPage {
  protected readonly store = inject(TeamStore);

  constructor() {
    this.store.fetchTeam();
  }

  protected roleTone(role: MemberRole): 'brand' | 'info' | 'neutral' {
    return role === 'Admin' ? 'brand' : role === 'Project Lead' ? 'info' : 'neutral';
  }
}

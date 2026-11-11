import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AvatarComponent } from '../../atoms/avatar/avatar';
import { IconComponent } from '../../atoms/icon/icon';
import { ShellLogo } from '../shell-nav/shell-nav';

/**
 * The shell's top bar: a logo panel the width of the sidebar, search, a few
 * actions and the signed-in user.
 *
 * The logo arrives as an input so the header stays presentational. The
 * workspaces and assistant buttons are placeholders whose behaviour is not
 * specified yet.
 */
@Component({
  selector: 'lib-shell-header',
  imports: [RouterLink, TranslatePipe, IconComponent, AvatarComponent],
  templateUrl: './shell-header.html',
  styleUrl: './shell-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellHeaderComponent {
  readonly logo = input<ShellLogo | null>(null);
  readonly userName = input('');
  readonly userAvatarUrl = input<string | null>(null);
  readonly hasUnread = input(false);
  /** Whether the phone-only navigation button reports the drawer as open. */
  readonly menuOpen = input(false);

  readonly menuToggled = output<void>();
}

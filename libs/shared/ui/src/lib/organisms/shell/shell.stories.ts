import type { Meta, StoryObj } from '@storybook/angular-vite';
import type { BrandTheme } from '@libs/theme';
import {
  FOOTER_ITEMS,
  NAV_ITEMS,
  PLATFORM_LOGO,
  WORKSPACES,
} from '../../../../.storybook/shell-fixtures';
import { ShellComponent } from './shell';

const meta: Meta<ShellComponent> = {
  title: 'Organisms/Shell',
  component: ShellComponent,
  parameters: { layout: 'fullscreen' },
  render: (args, { loaded }) => ({
    props: {
      ...args,
      brand: loaded['brand'] as BrandTheme,
      navItems: NAV_ITEMS,
      footerItems: FOOTER_ITEMS,
      workspaces: WORKSPACES,
      platformLogo: PLATFORM_LOGO,
    },
    template: `
      <lib-shell
        [navItems]="navItems"
        [footerItems]="footerItems"
        [brand]="brand"
        [workspaces]="workspaces"
        [platformLogo]="platformLogo"
        [userName]="userName"
        [hasUnread]="hasUnread"
      >
        <p style="padding: var(--space-6)">Page content</p>
      </lib-shell>`,
  }),
  args: { userName: 'Alex', hasUnread: true },
};
export default meta;

type Story = StoryObj<ShellComponent>;

/** Switch brand, workspace, direction and viewport from the toolbars. */
export const Default: Story = {};

export const NoUnread: Story = { args: { hasUnread: false } };

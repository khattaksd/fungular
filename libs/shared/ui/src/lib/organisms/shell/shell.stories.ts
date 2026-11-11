import type { Meta, StoryObj } from '@storybook/angular-vite';
import { FOOTER_ITEMS, NAV_ITEMS } from '../../../../.storybook/shell-fixtures';
import { ShellComponent } from './shell';

const meta: Meta<ShellComponent> = {
  title: 'Organisms/Shell',
  component: ShellComponent,
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    props: {
      ...args,
      navItems: NAV_ITEMS,
      footerItems: FOOTER_ITEMS,
    },
    template: `
      <lib-shell
        [navItems]="navItems"
        [footerItems]="footerItems"
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

/** Switch direction and viewport from the toolbars. */
export const Default: Story = {};

export const NoUnread: Story = { args: { hasUnread: false } };

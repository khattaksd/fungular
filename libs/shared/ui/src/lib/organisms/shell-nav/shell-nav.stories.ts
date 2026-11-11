import type { Meta, StoryObj } from '@storybook/angular-vite';
import { FOOTER_ITEMS, NAV_ITEMS } from '../../../../.storybook/shell-fixtures';
import { ShellNavComponent } from './shell-nav';

const meta: Meta<ShellNavComponent> = {
  title: 'Organisms/Shell nav',
  component: ShellNavComponent,
  args: {
    items: NAV_ITEMS,
    footerItems: FOOTER_ITEMS,
    collapsed: false,
  },
};
export default meta;

type Story = StoryObj<ShellNavComponent>;

export const Open: Story = {};

export const Collapsed: Story = { args: { collapsed: true } };

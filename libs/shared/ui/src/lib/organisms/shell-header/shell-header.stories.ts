import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ShellHeaderComponent } from './shell-header';

const meta: Meta<ShellHeaderComponent> = {
  title: 'Organisms/Shell header',
  component: ShellHeaderComponent,
  args: {
    logo: { url: '/favicon.ico', alt: 'fungular' },
    userName: 'Alex',
    hasUnread: true,
    menuOpen: false,
  },
};
export default meta;

type Story = StoryObj<ShellHeaderComponent>;

export const Default: Story = {};

export const NoUnread: Story = { args: { hasUnread: false } };

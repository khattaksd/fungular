import type { Meta, StoryObj } from '@storybook/angular-vite';
import { AvatarComponent } from './avatar';

const meta: Meta<AvatarComponent> = {
  title: 'Atoms/Avatar',
  component: AvatarComponent,
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
  args: { name: 'Alex Rivera', size: 'md' },
};
export default meta;

type Story = StoryObj<AvatarComponent>;

export const Initials: Story = {};

export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: var(--space-3); align-items: center">
        <lib-avatar [name]="name" size="sm" />
        <lib-avatar [name]="name" size="md" />
        <lib-avatar [name]="name" size="lg" />
      </div>`,
  }),
};

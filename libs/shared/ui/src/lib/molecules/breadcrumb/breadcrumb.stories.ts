import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BreadcrumbComponent } from './breadcrumb';

const meta: Meta<BreadcrumbComponent> = {
  title: 'Molecules/Breadcrumb',
  component: BreadcrumbComponent,
  args: {
    label: 'Your location',
    items: ['Grand Forks North', 'Line 4 · Shift B'],
  },
};
export default meta;

type Story = StoryObj<BreadcrumbComponent>;

export const Default: Story = {};

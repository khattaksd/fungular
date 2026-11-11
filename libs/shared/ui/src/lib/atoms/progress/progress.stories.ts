import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ProgressComponent } from './progress';

const meta: Meta<ProgressComponent> = {
  title: 'Atoms/Progress',
  component: ProgressComponent,
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 360px">
      <lib-progress [value]="value" [label]="label" [caption]="caption" [showValue]="showValue" />
    </div>`,
  }),
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
  },
  args: { value: 50, label: 'Course progress', showValue: false },
};
export default meta;

type Story = StoryObj<ProgressComponent>;

export const Bar: Story = {};

export const WithCaption: Story = {
  args: { caption: 'Section 2 of 4', showValue: true },
};

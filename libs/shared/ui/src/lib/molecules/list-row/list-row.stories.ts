import {
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular-vite';
import { BadgeComponent } from '../../atoms/badge/badge';
import { ListRowComponent } from './list-row';

const meta: Meta<ListRowComponent> = {
  title: 'Molecules/List row',
  component: ListRowComponent,
  decorators: [moduleMetadata({ imports: [BadgeComponent] })],
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 640px">
        <lib-list-row [icon]="icon" [heading]="heading" [meta]="meta" [route]="route">
          <lib-badge row-status tone="brand" pill size="sm">In progress</lib-badge>
        </lib-list-row>
      </div>`,
  }),
  args: {
    icon: 'book',
    heading: 'Complete your GMP refresher',
    meta: 'Required learning · 8 min remaining',
    route: '/',
  },
};
export default meta;

type Story = StoryObj<ListRowComponent>;

export const Linked: Story = {};
export const Static: Story = { args: { route: null } };

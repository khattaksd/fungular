import {
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular-vite';
import { ButtonComponent } from '../button/button';
import { BannerComponent } from './banner';

const meta: Meta<BannerComponent> = {
  title: 'Atoms/Banner',
  component: BannerComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  render: (args) => ({
    props: args,
    template: `
      <lib-banner [heading]="heading" [dismissible]="dismissible" dismissLabel="Dismiss">
        <strong>The service status has changed.</strong>
        Details are available on the dashboard.
        <ng-container banner-actions>
          <button libButton variant="outline" pill>View details</button>
          <button libButton variant="link">Dismiss</button>
        </ng-container>
      </lib-banner>`,
  }),
  args: { heading: 'What\u2019s new', dismissible: true },
};
export default meta;

type Story = StoryObj<BannerComponent>;

export const Default: Story = {};

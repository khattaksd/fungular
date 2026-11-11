import {
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular-vite';
import { ButtonComponent } from '../../atoms/button/button';
import { SectionHeaderComponent } from './section-header';

const meta: Meta<SectionHeaderComponent> = {
  title: 'Molecules/Section header',
  component: SectionHeaderComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  args: { heading: "Today's priorities" },
};
export default meta;

type Story = StoryObj<SectionHeaderComponent>;

export const Default: Story = {};

export const WithAction: Story = {
  render: (args) => ({
    props: args,
    template: `<lib-section-header [heading]="heading"><a libButton variant="link" href="#">View all</a></lib-section-header>`,
  }),
};

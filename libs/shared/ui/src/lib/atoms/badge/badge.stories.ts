import {
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular-vite';
import { IconComponent } from '../icon/icon';
import { BadgeComponent } from './badge';

const TONES = [
  'neutral',
  'brand',
  'danger',
  'success',
  'warning',
  'info',
] as const;
const VARIANTS = ['solid', 'soft', 'outline'] as const;

const meta: Meta<BadgeComponent> = {
  title: 'Atoms/Badge',
  component: BadgeComponent,
  render: (args) => ({
    props: args,
    template: `<lib-badge [tone]="tone" [variant]="variant" [pill]="pill" [size]="size">Badge</lib-badge>`,
  }),
  argTypes: {
    tone: { control: 'select', options: [...TONES] },
    variant: { control: 'select', options: [...VARIANTS] },
    pill: { control: 'boolean' },
    size: { control: 'select', options: ['md', 'sm'] },
  },
  args: { tone: 'neutral', variant: 'soft', pill: false, size: 'md' },
};
export default meta;

type Story = StoryObj<BadgeComponent>;

export const Playground: Story = {};

/** Every tone in every variant — the full surface the tokens have to cover. */
export const Matrix: Story = {
  render: () => ({
    props: { tones: TONES, variants: VARIANTS },
    template: `
      <div style="display: grid; gap: var(--space-3)">
        @for (variant of variants; track variant) {
          <div style="display: flex; gap: var(--space-2); flex-wrap: wrap">
            @for (tone of tones; track tone) {
              <lib-badge [tone]="tone" [variant]="variant">{{ tone }}</lib-badge>
            }
          </div>
        }
      </div>
    `,
  }),
};

export const Pill: Story = {
  args: { pill: true, tone: 'brand', variant: 'solid' },
};

/** Small pills, with and without a leading icon. */
export const Chips: Story = {
  decorators: [moduleMetadata({ imports: [IconComponent] })],
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-2); align-items: center">
        <lib-badge tone="warning" pill size="sm">Attention</lib-badge>
        <lib-badge tone="neutral" pill size="sm">
          <lib-icon name="clock" size="sm" /> Just now
        </lib-badge>
        <lib-badge tone="brand" pill size="sm">Active</lib-badge>
      </div>`,
  }),
};

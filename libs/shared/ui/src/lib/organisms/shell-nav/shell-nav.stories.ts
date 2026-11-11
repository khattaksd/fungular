import type { BrandTheme } from '@libs/theme';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import {
  FOOTER_ITEMS,
  NAV_ITEMS,
  PLATFORM_LOGO,
} from '../../../../.storybook/shell-fixtures';
import { ShellNavComponent } from './shell-nav';

const meta: Meta<ShellNavComponent> = {
  title: 'Organisms/Shell nav',
  component: ShellNavComponent,
  render: (args, { loaded }) => {
    const brand = loaded['brand'] as BrandTheme;
    return {
      props: {
        ...args,
        tenantLabel: brand.tenantLabel,
        tagline: brand.tagline,
        taglineSub: brand.taglineSub,
        platformLogo: PLATFORM_LOGO,
      },
    };
  },
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

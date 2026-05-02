import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ChordSelector } from './ChordSelector';

const meta: Meta<typeof ChordSelector> = {
  component: ChordSelector,
  args: {
    onSubmit: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof ChordSelector>;

export const Default: Story = {};

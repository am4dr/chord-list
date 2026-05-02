import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChordDiagram } from './ChordDiagram';

const meta: Meta<typeof ChordDiagram> = {
  component: ChordDiagram,
};
export default meta;

type Story = StoryObj<typeof ChordDiagram>;

export const CMajor: Story = {
  args: {
    fingering: { frets: [null, 3, 2, 0, 1, 0] },
    ariaLabel: 'C',
  },
};

export const AMinor: Story = {
  args: {
    fingering: { frets: [null, 0, 2, 2, 1, 0] },
    ariaLabel: 'Am',
  },
};

export const EMinor: Story = {
  args: {
    fingering: { frets: [0, 2, 2, 0, 0, 0] },
    ariaLabel: 'Em',
  },
};

export const FMajorBarre: Story = {
  args: {
    fingering: { frets: [1, 3, 3, 2, 1, 1] },
    ariaLabel: 'F',
  },
};

export const CSharpMajorHighPosition: Story = {
  args: {
    fingering: { frets: [null, 4, 6, 6, 6, 4] },
    ariaLabel: 'C#',
  },
};

export const Larger: Story = {
  args: {
    fingering: { frets: [null, 3, 2, 0, 1, 0] },
    ariaLabel: 'C',
    width: 200,
  },
};

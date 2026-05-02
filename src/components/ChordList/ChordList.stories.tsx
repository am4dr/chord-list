import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { Chord } from '../../domain/chord';
import { ChordList } from './ChordList';

const meta: Meta<typeof ChordList> = {
  component: ChordList,
  args: {
    onRemove: fn(),
    onMove: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof ChordList>;

const c: Chord = { root: { natural: 'C' }, quality: 'major' };
const am: Chord = { root: { natural: 'A' }, quality: 'minor' };
const f: Chord = { root: { natural: 'F' }, quality: 'major' };
const g: Chord = { root: { natural: 'G' }, quality: 'major' };
const cSharpMinor: Chord = {
  root: { natural: 'C', accidental: 'sharp' },
  quality: 'minor',
};

export const Empty: Story = {
  args: { chords: [] },
};

export const SingleChord: Story = {
  args: { chords: [c] },
};

export const CommonProgression: Story = {
  args: { chords: [c, g, am, f] },
};

export const MixedPositions: Story = {
  args: { chords: [c, cSharpMinor, f, am] },
};

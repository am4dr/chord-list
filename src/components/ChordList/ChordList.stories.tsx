import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { Chord } from '../../domain/chord';
import { getFingering, type ChordVoicing } from '../../domain/fingering';
import { ChordList } from './ChordList';

const meta: Meta<typeof ChordList> = {
  component: ChordList,
  args: {
    onRemove: fn(),
    onMove: fn(),
    onInsert: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof ChordList>;

const v = (chord: Chord): ChordVoicing => ({ chord, fingering: getFingering(chord)! });

const c = v({ root: { natural: 'C' }, quality: 'major' });
const am = v({ root: { natural: 'A' }, quality: 'minor' });
const f = v({ root: { natural: 'F' }, quality: 'major' });
const g = v({ root: { natural: 'G' }, quality: 'major' });
const cSharpMinor = v({ root: { natural: 'C', accidental: 'sharp' }, quality: 'minor' });

export const Empty: Story = {
  args: { voicings: [] },
};

export const SingleChord: Story = {
  args: { voicings: [c] },
};

export const CommonProgression: Story = {
  args: { voicings: [c, g, am, f] },
};

export const MixedPositions: Story = {
  args: { voicings: [c, cSharpMinor, f, am] },
};

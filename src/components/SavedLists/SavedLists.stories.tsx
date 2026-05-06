import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { ChordVoicing } from '../../domain/fingering';
import { SavedLists } from './SavedLists';

const meta: Meta<typeof SavedLists> = {
  component: SavedLists,
  args: {
    onSave: fn(),
    onLoad: fn(),
    onDelete: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof SavedLists>;

const cMajor: ChordVoicing = {
  chord: { root: { natural: 'C' }, quality: 'major' },
  fingering: { frets: [null, 3, 2, 0, 1, 0] },
};

const gMajor: ChordVoicing = {
  chord: { root: { natural: 'G' }, quality: 'major' },
  fingering: { frets: [3, 2, 0, 0, 0, 3] },
};

const aMinor: ChordVoicing = {
  chord: { root: { natural: 'A' }, quality: 'minor' },
  fingering: { frets: [null, 0, 2, 2, 1, 0] },
};

const fMajor: ChordVoicing = {
  chord: { root: { natural: 'F' }, quality: 'major' },
  fingering: { frets: [1, 3, 3, 2, 1, 1] },
};

export const Empty: Story = {
  args: { savedLists: {}, currentCount: 0 },
};

export const WithCurrent: Story = {
  args: { savedLists: {}, currentCount: 4 },
};

export const FewEntries: Story = {
  args: {
    currentCount: 0,
    savedLists: {
      intro: [cMajor, gMajor],
      verse: [cMajor, gMajor, aMinor, fMajor],
      bridge: [aMinor, fMajor],
    },
  },
};

export const LongName: Story = {
  args: {
    currentCount: 0,
    savedLists: {
      'これはとても長い名前のコードリストでellipsis表示の確認に使うサンプルです': [cMajor],
    },
  },
};

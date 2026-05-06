import { useEffect, useState } from 'react';
import type { ChordVoicing } from './domain/fingering';
import { ChordSelector } from './components/ChordSelector/ChordSelector';
import { ChordList } from './components/ChordList/ChordList';
import { SavedLists } from './components/SavedLists/SavedLists';
import { insertAt, moveItem, removeAt } from './utils/array';
import {
  deleteSavedList,
  loadCurrentList,
  loadSavedLists,
  putSavedList,
  saveCurrentList,
} from './utils/storage';
import './App.css';

function cloneVoicing(v: ChordVoicing): ChordVoicing {
  return {
    chord: { ...v.chord, root: { ...v.chord.root } },
    fingering: { frets: [...v.fingering.frets] },
  };
}

function App() {
  const [voicings, setVoicings] = useState<ChordVoicing[]>(() => loadCurrentList());
  const [savedLists, setSavedLists] = useState<Record<string, ChordVoicing[]>>(() =>
    loadSavedLists(),
  );

  useEffect(() => {
    saveCurrentList(voicings);
  }, [voicings]);

  const handleAdd = (voicing: ChordVoicing) => {
    setVoicings((prev) => [...prev, voicing]);
  };

  const handleRemove = (index: number) => {
    setVoicings((prev) => removeAt(prev, index));
  };

  const handleMove = (from: number, to: number) => {
    setVoicings((prev) => moveItem(prev, from, to));
  };

  const handleInsert = (voicing: ChordVoicing, index: number) => {
    setVoicings((prev) => insertAt(prev, voicing, index));
  };

  const handleSaveList = (name: string) => {
    if (savedLists[name] && !window.confirm(`「${name}」を上書きしますか?`)) return;
    setSavedLists(putSavedList(name, voicings));
  };

  const handleLoadList = (name: string) => {
    const list = savedLists[name];
    if (!list) return;
    if (voicings.length > 0 && !window.confirm('現在のリストを置き換えますか?')) return;
    setVoicings(list.map(cloneVoicing));
  };

  const handleDeleteList = (name: string) => {
    if (!window.confirm(`「${name}」を削除しますか?`)) return;
    setSavedLists(deleteSavedList(name));
  };

  return (
    <main>
      <h1>Chords</h1>
      <ChordSelector onSubmit={handleAdd} />
      <hr />
      <SavedLists
        savedLists={savedLists}
        currentCount={voicings.length}
        onSave={handleSaveList}
        onLoad={handleLoadList}
        onDelete={handleDeleteList}
      />
      <hr />
      <ChordList
        voicings={voicings}
        onRemove={handleRemove}
        onMove={handleMove}
        onInsert={handleInsert}
      />
    </main>
  );
}

export default App;

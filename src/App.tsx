import { useState } from 'react';
import type { ChordVoicing } from './domain/fingering';
import { ChordSelector } from './components/ChordSelector/ChordSelector';
import { ChordList } from './components/ChordList/ChordList';
import { insertAt, moveItem, removeAt } from './utils/array';
import './App.css';

function App() {
  const [voicings, setVoicings] = useState<ChordVoicing[]>([]);

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

  return (
    <main>
      <h1>Chords</h1>
      <ChordSelector onSubmit={handleAdd} />
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

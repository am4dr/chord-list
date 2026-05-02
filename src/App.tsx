import { useState } from 'react';
import type { Chord } from './domain/chord';
import { ChordSelector } from './components/ChordSelector/ChordSelector';
import { ChordList } from './components/ChordList/ChordList';
import { moveItem, removeAt } from './utils/array';
import './App.css';

function App() {
  const [chords, setChords] = useState<Chord[]>([]);

  const handleAdd = (chord: Chord) => {
    setChords((prev) => [...prev, chord]);
  };

  const handleRemove = (index: number) => {
    setChords((prev) => removeAt(prev, index));
  };

  const handleMove = (from: number, to: number) => {
    setChords((prev) => moveItem(prev, from, to));
  };

  return (
    <main>
      <h1>Chords</h1>
      <ChordSelector onSubmit={handleAdd} />
      <hr />
      <ChordList chords={chords} onRemove={handleRemove} onMove={handleMove} />
    </main>
  );
}

export default App;

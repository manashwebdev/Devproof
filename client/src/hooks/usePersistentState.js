import { useState } from 'react';

// Keeps results and form text alive while the person switches between tools.
const memory = new Map();

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => (memory.has(key) ? memory.get(key) : initial));
  const update = (next) => {
    memory.set(key, next);
    setValue(next);
  };
  return [value, update];
}

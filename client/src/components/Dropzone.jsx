import { useRef, useState } from 'react';

export default function Dropzone({ label, file, onFile }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);

  const pick = (f) => {
    if (f && /\.pdf$/i.test(f.name)) onFile(f);
  };
  const open = () => input.current?.click();

  return (
    <div
      className={`drop ${over ? 'over' : ''} ${file ? 'has-file' : ''}`}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files?.[0]);
      }}
    >
      <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <strong>{file ? file.name : label}</strong>
      <span>{file ? `${Math.max(1, Math.round(file.size / 1024))} KB. Click to replace.` : 'Drop a PDF here or click to browse'}</span>
      {file && (
        <button
          type="button"
          className="link"
          onClick={(e) => {
            e.stopPropagation();
            onFile(null);
          }}
        >
          Remove file
        </button>
      )}
    </div>
  );
}

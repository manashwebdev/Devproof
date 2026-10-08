import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import PageHead from '../components/PageHead.jsx';
import Dropzone from '../components/Dropzone.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import SubmitButton from '../components/SubmitButton.jsx';

const signed = (n) => (n > 0 ? `+${n}` : String(n));
const tone = (n) => (n > 0 ? 'up' : n < 0 ? 'down' : 'muted');

export default function ResumeDiff() {
  const [beforeText, setBeforeText] = usePersistentState('diff.beforeText', '');
  const [afterText, setAfterText] = usePersistentState('diff.afterText', '');
  const [result, setResult] = usePersistentState('diff.result', null);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasBefore = Boolean(beforeFile) || beforeText.trim().length >= 40;
  const hasAfter = Boolean(afterFile) || afterText.trim().length >= 40;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData();
    if (beforeFile) form.append('before', beforeFile);
    else form.append('beforeText', beforeText);
    if (afterFile) form.append('after', afterFile);
    else form.append('afterText', afterText);
    try {
      setResult(await api.diff(form));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <PageHead title="Compare resume versions">
        Add an older and a newer version of your resume to see what changed and whether the update reads stronger.
      </PageHead>

      <form className="card" onSubmit={submit}>
        <div className="two-col field">
          <div>
            <span className="label">Older version</span>
            <Dropzone label="Choose the older PDF" file={beforeFile} onFile={setBeforeFile} />
          </div>
          <div>
            <span className="label">Newer version</span>
            <Dropzone label="Choose the newer PDF" file={afterFile} onFile={setAfterFile} />
          </div>
        </div>
        <details>
          <summary>Paste text instead</summary>
          <div className="two-col">
            <textarea value={beforeText} onChange={(e) => setBeforeText(e.target.value)} placeholder="Older version text" aria-label="Older version text" />
            <textarea value={afterText} onChange={(e) => setAfterText(e.target.value)} placeholder="Newer version text" aria-label="Newer version text" />
          </div>
        </details>
        <SubmitButton loading={loading} disabled={!hasBefore || !hasAfter} loadingText="Comparing">
          Compare versions
        </SubmitButton>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {result && (
        <motion.div key={`${result.afterStrength}-${result.similarity}`} className="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <section className="card summary">
            <ScoreRing value={result.afterStrength} label="New version strength" />
            <div>
              <h2>{result.verdict}</h2>
              <p className="muted">
                Strength moved from {result.beforeStrength} to {result.afterStrength} ({signed(result.delta)}). The two versions share {result.similarity}% of their wording.
              </p>
              <p className="muted" style={{ marginTop: 8, fontSize: '0.85rem' }}>
                Strength is an estimate based on skills listed, numbers, bullet points and links.
              </p>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">What changed in the details</h2>
            <div className="row muted">
              <span>Measure</span>
              <span>Before</span>
              <span>After</span>
              <span>Change</span>
            </div>
            {result.signals.map((s) => (
              <div className="row" key={s.label}>
                <span>{s.label}</span>
                <span>{s.before}</span>
                <span>{s.after}</span>
                <strong className={tone(s.change)}>{signed(s.change)}</strong>
              </div>
            ))}
          </section>

          <section className="card">
            <h2 className="section-title">Skills</h2>
            {result.skills.added.map((s) => <span key={`a-${s}`} className="chip add">Added: {s}</span>)}
            {result.skills.removed.map((s) => <span key={`r-${s}`} className="chip remove">Removed: {s}</span>)}
            {result.skills.kept.map((s) => <span key={`k-${s}`} className="chip">{s}</span>)}
          </section>

          <section className="grid-2">
            <div className="card">
              <h2 className="section-title">Lines added</h2>
              <div className="lines">
                {result.lines.added.length ? result.lines.added.map((l, i) => <p className="add" key={i}>{l}</p>) : <p className="muted">No new lines.</p>}
              </div>
            </div>
            <div className="card">
              <h2 className="section-title">Lines removed</h2>
              <div className="lines">
                {result.lines.removed.length ? result.lines.removed.map((l, i) => <p className="remove" key={i}>{l}</p>) : <p className="muted">No lines removed.</p>}
              </div>
            </div>
          </section>
        </motion.div>
      )}
    </div>
  );
}

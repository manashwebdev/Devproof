import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import PageHead from '../components/PageHead.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import SubmitButton from '../components/SubmitButton.jsx';

export default function ProjectHealth() {
  const [repo, setRepo] = usePersistentState('health.repo', '');
  const [result, setResult] = usePersistentState('health.result', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setResult(await api.health(repo));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <PageHead title="Check project health">
        Enter a repository to see how ready it is for a recruiter: documentation, presentation, structure and recent activity.
      </PageHead>

      <form className="card" onSubmit={submit}>
        <div className="field">
          <label htmlFor="repo">Repository</label>
          <input id="repo" type="text" placeholder="owner/name or a GitHub link" value={repo} onChange={(e) => setRepo(e.target.value)} autoComplete="off" required />
        </div>
        <SubmitButton loading={loading} disabled={!repo.trim()} loadingText="Analyzing">
          Check health
        </SubmitButton>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {result && (
        <motion.div key={`${result.repo}-${result.score}`} className="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <section className="card summary">
            <ScoreRing value={result.score} label="Health score" />
            <div>
              <h2>{result.grade}</h2>
              <p className="muted">
                <a href={result.url} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)' }}>{result.repo}</a>
                {result.language ? `, mostly ${result.language}` : ''}
              </p>
            </div>
          </section>

          {result.recommendations.length > 0 && (
            <section className="card">
              <h2 className="section-title">Fix these first</h2>
              <ol className="todo">
                {result.recommendations.map((r) => (
                  <li key={r.tip}>
                    {r.tip} <span className="muted">({r.area})</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="grid-2">
            {result.categories.map((c) => (
              <div className="card" key={c.name}>
                <div className="cat-head">
                  <h2 className="section-title" style={{ margin: 0 }}>{c.name}</h2>
                  <span className="muted">{c.score} of {c.max}</span>
                </div>
                <div className="bar" style={{ marginBottom: 12 }}>
                  <motion.i initial={{ width: 0 }} animate={{ width: `${(c.score / c.max) * 100}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} />
                </div>
                {c.checks.map((k) => (
                  <div className="check" key={k.label}>
                    <span className={`dot ${k.passed ? 'ok' : 'fail'}`} aria-hidden="true" />
                    <div>
                      {k.label}
                      <span className="sr-only">{k.passed ? ' passed' : ' needs work'}</span>
                      {!k.passed && <small>{k.tip}</small>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>
        </motion.div>
      )}
    </div>
  );
}

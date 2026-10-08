import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import PageHead from '../components/PageHead.jsx';
import Dropzone from '../components/Dropzone.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import Level from '../components/Level.jsx';
import SubmitButton from '../components/SubmitButton.jsx';

const LEVELS = ['Strong', 'Moderate', 'Weak', 'No Evidence'];
const list = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const rowAnim = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function SkillRow({ row }) {
  const proof = row.evidence.map((e) => `${e.repo} (${e.via.join(', ')})`).join('; ');
  return (
    <motion.div className="skill" variants={rowAnim}>
      <strong>{row.skill}</strong>
      <Level level={row.level} />
      <div>
        <div className="bar">
          <motion.i initial={{ width: 0 }} animate={{ width: `${Math.min(row.points * 10, 100)}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} />
        </div>
        <small>{proof || 'No matching repository found.'}</small>
      </div>
    </motion.div>
  );
}

export default function Verifier() {
  const [username, setUsername] = usePersistentState('verify.username', '');
  const [text, setText] = usePersistentState('verify.text', '');
  const [result, setResult] = usePersistentState('verify.result', null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData();
    form.append('username', username);
    if (file) form.append('resume', file);
    else form.append('resumeText', text);
    try {
      setResult(await api.verify(form));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <PageHead title="Verify resume claims">
        Upload your resume and enter your GitHub username. Each skill is checked against your languages, dependencies, topics, descriptions and READMEs.
      </PageHead>

      <form className="card" onSubmit={submit}>
        <div className="field">
          <label htmlFor="username">GitHub username</label>
          <input id="username" type="text" placeholder="octocat" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" required />
        </div>
        <div className="field">
          <span className="label">Resume</span>
          <Dropzone label="Choose your resume PDF" file={file} onFile={setFile} />
        </div>
        <details open={!file && Boolean(text)}>
          <summary>Paste resume text instead</summary>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the text of your resume here" aria-label="Resume text" />
        </details>
        <SubmitButton loading={loading} disabled={!username.trim() || (!file && text.trim().length < 40)} loadingText="Checking your repositories">
          Verify claims
        </SubmitButton>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {result && (
        <motion.div key={`${result.username}-${result.trustScore}`} className="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <section className="card summary">
            <ScoreRing value={result.trustScore} label="Trust score" />
            <div>
              <h2>{result.verdict}</h2>
              <p className="muted" style={{ marginBottom: 14 }}>
                @{result.username}: {result.reposAnalyzed} of {result.publicRepos} public repositories checked
              </p>
              <div className="counts">
                {LEVELS.map((l) => (
                  <Level key={l} level={l}>
                    {result.counts[l]} {l}
                  </Level>
                ))}
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Skill by skill</h2>
            <motion.div variants={list} initial="hidden" animate="show">
              {result.skills.map((row) => (
                <SkillRow key={row.skill} row={row} />
              ))}
            </motion.div>
          </section>

          {result.gaps.length > 0 && (
            <section className="card">
              <h2 className="section-title">Skills with no public proof</h2>
              <p className="muted" style={{ marginBottom: 14 }}>
                Publish a project that uses these, or remove them from your resume.
              </p>
              {result.gaps.map((g) => (
                <span key={g} className="chip remove">{g}</span>
              ))}
            </section>
          )}
        </motion.div>
      )}
    </div>
  );
}

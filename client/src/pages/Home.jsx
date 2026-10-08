import { useEffect, useState } from 'react';
import ScoreRing from '../components/ScoreRing.jsx';
import { VerifyIcon, DiffIcon, HealthIcon } from '../components/Icons.jsx';
import { api } from '../api/client.js';

const TOOLS = [
  { id: 'verify', Icon: VerifyIcon, title: 'Verify resume claims', text: 'Match every skill on your resume against the repositories you have actually published.' },
  { id: 'diff', Icon: DiffIcon, title: 'Compare resume versions', text: 'See which skills, numbers and lines changed between two versions and whether the new one is stronger.' },
  { id: 'health', Icon: HealthIcon, title: 'Check project health', text: 'Score a repository on documentation, presentation, structure and activity, with a to-do list.' },
];

export default function Home() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.status().then(setStatus).catch(() => setStatus(false));
  }, []);

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <h1>Your resume says a lot. Let your code prove it.</h1>
          <p className="lead">
            DevProof checks your resume against your public GitHub work, compares versions of your resume, and tells you whether a project is ready to show a recruiter.
          </p>
          <a className="btn" href="#/verify">
            Verify my resume
          </a>
        </div>
        <div className="hero-ring">
          <ScoreRing value={87} size={230} label="Sample trust score" />
          <p className="muted">Every skill you list is rated Strong, Moderate, Weak or No Evidence.</p>
        </div>
      </section>

      <section className="tools">
        {TOOLS.map(({ id, Icon, title, text }) => (
          <a key={id} href={`#/${id}`} className="card tool-card">
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </a>
        ))}
      </section>

      {status === false && <p className="error">The API is not running. Start everything with "npm run dev" from the project folder.</p>}
      {status && !status.github && (
        <p className="notice">
          No GitHub token is set. GitHub allows 60 requests per hour without one, which covers a few checks. Add GITHUB_TOKEN to server/.env to raise the limit.
        </p>
      )}
    </div>
  );
}

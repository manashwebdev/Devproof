import { motion } from 'framer-motion';

const LINKS = [
  ['verify', 'Verify claims'],
  ['diff', 'Compare resumes'],
  ['health', 'Project health'],
  ['history', 'History'],
];

export default function Navbar({ route }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="#/home">
          <span className="brand-dot" />
          DevProof
        </a>
        <nav className="links" aria-label="Tools">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#/${id}`} className={route === id ? 'active' : ''} aria-current={route === id ? 'page' : undefined}>
              {route === id && (
                <motion.span layoutId="nav-pill" className="pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
              )}
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

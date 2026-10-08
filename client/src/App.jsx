import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Background from './components/Background.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Verifier from './pages/Verifier.jsx';
import ResumeDiff from './pages/ResumeDiff.jsx';
import ProjectHealth from './pages/ProjectHealth.jsx';
import History from './pages/History.jsx';
import { useHashRoute } from './hooks/useHashRoute.js';

const PAGES = { home: Home, verify: Verifier, diff: ResumeDiff, health: ProjectHealth, history: History };

export default function App() {
  const [route] = useHashRoute();
  const Page = PAGES[route];

  return (
    <MotionConfig reducedMotion="user">
      <Background />
      <Navbar route={route} />
      <main className="container">
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
          >
            <Page />
          </motion.div>
        </AnimatePresence>
      </main>
      <p className="footer">DevProof checks public information only. Scores are estimates to guide your next step.</p>
    </MotionConfig>
  );
}

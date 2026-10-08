import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import PageHead from '../components/PageHead.jsx';

const TYPE_LABEL = { verify: 'Claim check', diff: 'Resume comparison', health: 'Project health' };
const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function History() {
  const [state, setState] = useState({ loading: true, enabled: false, items: [], error: '' });

  useEffect(() => {
    api
      .history()
      .then((data) => setState({ loading: false, enabled: data.enabled, items: data.items, error: '' }))
      .catch((err) => setState({ loading: false, enabled: false, items: [], error: err.message }));
  }, []);

  async function remove(id) {
    try {
      await api.removeHistory(id);
      setState((s) => ({ ...s, items: s.items.filter((i) => i._id !== id) }));
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    }
  }

  return (
    <div className="stack">
      <PageHead title="History">Every check you run is saved here, so you can see your scores improve over time.</PageHead>

      {state.error && <p className="error" role="alert">{state.error}</p>}
      {!state.loading && !state.error && !state.enabled && (
        <p className="notice">
          History is off. Add a MongoDB connection string as MONGODB_URI in server/.env (a free MongoDB Atlas cluster works), then restart the server.
        </p>
      )}
      {state.enabled && state.items.length === 0 && <p className="card muted">Nothing saved yet. Run a check and it will show up here.</p>}

      {state.items.length > 0 && (
        <section className="card">
          {state.items.map((item) => (
            <div className="history-item" key={item._id}>
              <div>
                <strong>{item.title}</strong>
                <p className="muted" style={{ fontSize: '0.88rem' }}>
                  {TYPE_LABEL[item.type]}, {formatDate(item.createdAt)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {item.score !== null && <strong>{item.score}</strong>}
                <button className="btn ghost small" onClick={() => remove(item._id)} aria-label={`Delete ${item.title}`}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

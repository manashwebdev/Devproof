import { useEffect, useState } from 'react';

export const ROUTES = ['home', 'verify', 'diff', 'health', 'history'];

const read = () => {
  const name = window.location.hash.replace(/^#\/?/, '');
  return ROUTES.includes(name) ? name : 'home';
};

export function useHashRoute() {
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const go = (name) => {
    window.location.hash = `#/${name}`;
  };
  return [route, go];
}

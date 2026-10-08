const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

export const VerifyIcon = () => (
  <Svg>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

export const DiffIcon = () => (
  <Svg>
    <rect x="3" y="4" width="8" height="16" rx="2" />
    <rect x="13" y="4" width="8" height="16" rx="2" />
    <path d="M6 9h2M6 13h2M16 9h2M16 13h2" />
  </Svg>
);

export const HealthIcon = () => (
  <Svg>
    <path d="M3 12h4l2-6 4 12 2-6h6" />
  </Svg>
);

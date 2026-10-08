export default function Level({ level, children }) {
  const slug = level.toLowerCase().replace(/\s+/g, '-');
  return <span className={`level level-${slug}`}>{children ?? level}</span>;
}

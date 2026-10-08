export default function SubmitButton({ loading, disabled, loadingText, children }) {
  return (
    <button className="btn" type="submit" disabled={loading || disabled}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {loading ? loadingText : children}
    </button>
  );
}

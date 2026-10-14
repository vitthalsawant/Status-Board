import './Button.css';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

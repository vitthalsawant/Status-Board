import './Input.css';

export default function Input({
  id,
  label,
  error,
  trailing,
  multiline = false,
  className = '',
  ...props
}) {
  const Control = multiline ? 'textarea' : 'input';

  return (
    <div className={`field ${className}`.trim()}>
      {label ? (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="field__control">
        <Control
          id={id}
          className={`field__input ${multiline ? 'field__input--area' : ''} ${
            trailing ? 'field__input--trailing' : ''
          } ${error ? 'field__input--error' : ''}`.trim()}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {trailing ? <div className="field__trailing">{trailing}</div> : null}
      </div>
      {error ? (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

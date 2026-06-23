const Input = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
  options = [], // for type="select"
  rows = 3, // for type="textarea"
  className = '',
  ...props
}) => {
  const inputStyles = `
    w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20
    ${
      error
        ? 'border-rose-300 focus:border-rose-500 text-rose-900 placeholder-rose-300'
        : 'border-slate-200 focus:border-emerald-500 text-slate-800 placeholder-slate-400 hover:border-slate-300 bg-white'
    }
  `;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={inputStyles}
          required={required}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className={inputStyles}
          required={required}
          {...props}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputStyles}
          required={required}
          {...props}
        />
      )}

      {error && <span className="text-xs font-medium text-rose-500">{error}</span>}
    </div>
  );
};

export default Input;

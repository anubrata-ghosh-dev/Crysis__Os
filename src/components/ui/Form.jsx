/**
 * CRYSIS OS Input Component
 * Reusable form input field
 */

export const Input = ({
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  disabled = false,
  isDarkMode = false,
  className = "",
  ...props
}) => {
  const inputStyle = isDarkMode
    ? {
        backgroundColor: "#1f2937",
        color: "#f3f4f6",
        borderColor: "#4b5563",
        WebkitTextFillColor: "#f3f4f6"
      }
    : {
        backgroundColor: "#ffffff",
        color: "#111827",
        borderColor: "#d1d5db",
        WebkitTextFillColor: "#111827"
      };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${className}`}
      style={inputStyle}
      {...props}
    />
  );
};

export const Label = ({ htmlFor = "", children, className = "", style = {}, ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-black dark:text-gray-100 mb-2 transition-colors ${className}`}
    style={style}
    {...props}
  >
    {children}
  </label>
);

export const Select = ({
  value = "",
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  isDarkMode = false,
  className = "",
  ...props
}) => {
  const selectStyle = isDarkMode
    ? {
        backgroundColor: "#1f2937",
        color: "#f3f4f6",
        borderColor: "#4b5563",
        WebkitTextFillColor: "#f3f4f6",
        opacity: 1
      }
    : {
        backgroundColor: "#ffffff",
        color: "#111827",
        borderColor: "#d1d5db",
        WebkitTextFillColor: "#111827",
        opacity: 1
      };

  const optionStyle = isDarkMode
    ? { backgroundColor: "#1f2937", color: "#f3f4f6" }
    : { backgroundColor: "#ffffff", color: "#111827" };

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed transition-colors ${className}`}
      style={selectStyle}
      {...props}
    >
      <option value="" style={optionStyle}>{placeholder}</option>
      {options.map(({ value: optValue, label }) => (
        <option key={optValue} value={optValue} style={optionStyle}>
          {label}
        </option>
      ))}
    </select>
  );
};

export const TextArea = ({
  placeholder = "",
  value = "",
  onChange,
  rows = 4,
  disabled = false,
  isDarkMode = false,
  className = "",
  ...props
}) => {
  const textAreaStyle = isDarkMode
    ? {
        backgroundColor: "#1f2937",
        color: "#f3f4f6",
        borderColor: "#4b5563",
        WebkitTextFillColor: "#f3f4f6"
      }
    : {
        backgroundColor: "#ffffff",
        color: "#111827",
        borderColor: "#d1d5db",
        WebkitTextFillColor: "#111827"
      };

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${className}`}
      style={textAreaStyle}
      {...props}
    />
  );
};

export default {
  Input,
  Label,
  Select,
  TextArea
};

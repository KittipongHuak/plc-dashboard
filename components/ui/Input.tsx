import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

type BaseInputProps = {
  label?: string;
  error?: string | null;
  helperText?: string;
  required?: boolean;
};

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
  type?: "text" | "number" | "email" | "password";
  as?: "input";
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {
  as: "textarea";
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseInputProps {
  as: "select";
  options: { value: string; label: string }[];
}

type InputProps = TextInputProps | TextAreaProps | SelectProps;

export default function Input(props: InputProps) {
  const { label, error, helperText, required, className = "", ...rest } = props;

  const wrapperClass = "flex flex-col gap-1.5 w-full";
  const labelClass = "text-label-md font-semibold text-on-surface";
  const errorClass = "text-body-sm text-error mt-0.5 flex items-center gap-1";
  const helperClass = "text-label-md text-on-surface-variant mt-0.5";
  
  const baseInputStyle = `p-3 bg-surface-container-low border rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-all disabled:opacity-50 disabled:pointer-events-none w-full ${
    error ? "border-error focus:border-error" : "border-outline focus:border-primary"
  }`;

  const renderInput = () => {
    if (props.as === "textarea") {
      const { as, ...textareaProps } = rest as any;
      return (
        <textarea
          className={`${baseInputStyle} resize-y ${className}`}
          {...textareaProps}
        />
      );
    }

    if (props.as === "select") {
      const { as, options, ...selectProps } = rest as any;
      return (
        <select className={`${baseInputStyle} cursor-pointer ${className}`} {...selectProps}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    // Default input
    const { as, type = "text", ...inputProps } = rest as any;
    return (
      <input
        type={type}
        className={`${baseInputStyle} ${className}`}
        {...inputProps}
      />
    );
  };

  return (
    <div className={wrapperClass}>
      {label && (
        <label className={labelClass}>
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className={errorClass}>
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
      {!error && helperText && <p className={helperClass}>{helperText}</p>}
    </div>
  );
}

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "text" | "error";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide transition-all select-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:opacity-90 shadow-sm active:scale-[0.98]",
    secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:scale-[0.98]",
    outline: "border border-outline text-primary hover:bg-primary-container/10 active:scale-[0.98]",
    text: "text-primary hover:bg-primary-container/10 active:scale-[0.98]",
    error: "bg-error text-on-error hover:opacity-90 shadow-sm active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-label-sm",
    md: "px-5 py-2.5 text-label-md",
    lg: "px-6 py-3.5 text-label-lg",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>กำลังโหลด...</span>
        </>
      ) : (
        <>
          {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

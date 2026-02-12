/* ============================================
   UI COMPONENT LIBRARY (MOCK)
   ============================================
   
   These are deterministic, whitelisted components.
   Real implementation would use actual UI framework.
*/

import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  onClick
}) => (
  <button
    className={`btn btn-${variant} ${fullWidth ? 'w-full' : ''}`}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children }) => (
  <div className="card">
    {title && <h3>{title}</h3>}
    {subtitle && <p className="subtitle">{subtitle}</p>}
    {children}
  </div>
);

interface HeaderProps {
  title: string;
  subtitle?: string;
  showNav?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showNav }) => (
  <header className="header">
    <h1>{title}</h1>
    {subtitle && <p className="subtitle">{subtitle}</p>}
    {showNav && (
      <nav className="nav">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    )}
  </header>
);

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  value,
  onChange
}) => (
  <div className="form-group">
    {label && <label>{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      value={value}
      onChange={e => onChange?.(e.target.value)}
    />
  </div>
);

interface SelectProps {
  label?: string;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  required = false,
  disabled = false,
  value,
  onChange
}) => (
  <div className="form-group">
    {label && <label>{label}</label>}
    <select
      required={required}
      disabled={disabled}
      value={value}
      onChange={e => onChange?.(e.target.value)}
    >
      <option value="">Select...</option>
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder,
  rows = 4,
  required = false,
  value,
  onChange
}) => (
  <div className="form-group">
    {label && <label>{label}</label>}
    <textarea
      placeholder={placeholder}
      rows={rows}
      required={required}
      value={value}
      onChange={e => onChange?.(e.target.value)}
    />
  </div>
);

interface ModalProps {
  title: string;
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

interface ListProps {
  items: any[];
  renderItem: (item: any) => ReactNode;
}

export const List: React.FC<ListProps> = ({ items, renderItem }) => (
  <ul className="list">
    {items.map((item, index) => (
      <li key={index}>{renderItem(item)}</li>
    ))}
  </ul>
);

interface GridProps {
  columns: number;
  gap?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export const Grid: React.FC<GridProps> = ({ columns, gap = 'md', children }) => (
  <div className={`grid grid-${columns} gap-${gap}`}>{children}</div>
);

interface StackProps {
  direction: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export const Stack: React.FC<StackProps> = ({ direction, spacing = 'md', children }) => (
  <div className={`stack stack-${direction} spacing-${spacing}`}>{children}</div>
);

interface AlertProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const Alert: React.FC<AlertProps> = ({ message, type = 'info' }) => (
  <div className={`alert alert-${type}`}>{message}</div>
);

interface DividerProps {
  spacing?: 'sm' | 'md' | 'lg';
}

export const Divider: React.FC<DividerProps> = ({ spacing = 'md' }) => (
  <div className={`divider divider-${spacing}`} />
);

interface TextProps {
  content: string;
  variant?: 'body' | 'small' | 'large';
}

export const Text: React.FC<TextProps> = ({ content, variant = 'body' }) => (
  <p className={`text text-${variant}`}>{content}</p>
);

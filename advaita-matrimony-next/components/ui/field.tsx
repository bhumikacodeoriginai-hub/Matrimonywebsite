'use client';

/**
 * Form fields.
 *
 * ACCESSIBILITY CONTRACT — every field in this file guarantees:
 *  • a real <label for=...>, never a placeholder standing in for one
 *  • `aria-invalid` when errored, and `aria-describedby` wiring the error AND the
 *    help text to the control (both, in that order, so the error is read first)
 *  • the error is in an `aria-live="polite"` region so it is announced when it
 *    appears rather than only on the next focus
 *  • `(required)` in the accessible name — an asterisk alone is meaningless to a
 *    screen reader
 *  • ids generated with `useId`, so a field can be rendered many times on a page
 *    (search filters, repeated wizard steps) without colliding
 */

import { useId, useState, type ChangeEvent, type ReactNode } from 'react';
import { Icon, type IconName } from './icon';
import styles from './field.module.css';

/* ==========================================================================
   Shared bits
   ========================================================================== */

interface BaseFieldProps {
  label: string;
  name: string;
  /** Guidance shown under the field. Always visible — never a tooltip only. */
  help?: string;
  /** Validation message. Presence switches the field into its invalid state. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: IconName;
}

/** Builds the aria-describedby list, error first so it is announced first. */
function describedBy(errorId: string | null, helpId: string | null): string | undefined {
  const ids = [errorId, helpId].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

function FieldMessages({
  error,
  errorId,
  help,
  helpId,
  counter,
}: {
  error?: string;
  errorId: string;
  help?: string;
  helpId: string;
  counter?: ReactNode;
}) {
  if (!error && !help && !counter) return null;

  return (
    <div className={styles.footRow}>
      <div>
        {/* The live region is always present so its content is announced when it
            changes. Rendering it only when errored means some screen readers
            never see the change at all. */}
        <p id={errorId} className={error ? styles.error : 'sr-only'} role="alert" aria-live="polite">
          {error && (
            <>
              <span className={styles.errorIcon} aria-hidden="true">
                <Icon name="alert" />
              </span>
              {error}
            </>
          )}
        </p>
        {help && (
          <p id={helpId} className={styles.help}>
            {help}
          </p>
        )}
      </div>
      {counter}
    </div>
  );
}

/* ==========================================================================
   TextField
   ========================================================================== */

export interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'date' | 'search' | 'url';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal' | 'search';
  maxLength?: number;
  minLength?: number;
  min?: number | string;
  max?: number | string;
  step?: number;
  /** Static text inside the shell, e.g. "+91". */
  prefix?: string;
  /** Shows a live character counter. Requires maxLength. */
  showCounter?: boolean;
  /** Adds a show/hide toggle. Only meaningful for type="password". */
  revealable?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  id?: string;
  /**
   * id of a <datalist>. Offers suggestions while keeping the field free text —
   * the right tool for fields like caste where a fixed list would be wrong.
   */
  list?: string;
}

export function TextField({
  label,
  name,
  type = 'text',
  value,
  defaultValue,
  onChange,
  onBlur,
  help,
  error,
  required = false,
  disabled = false,
  className,
  icon,
  autoComplete,
  inputMode,
  maxLength,
  minLength,
  min,
  max,
  step,
  prefix,
  showCounter = false,
  revealable = false,
  readOnly = false,
  autoFocus = false,
  id: providedId,
  list,
}: TextFieldProps) {
  const generatedId = useId();
  const id = providedId ?? `${name}-${generatedId}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const [revealed, setRevealed] = useState(false);
  const inputType = revealable && revealed ? 'text' : type;

  const length = value?.length ?? 0;
  const counter =
    showCounter && maxLength ? (
      <span
        className={[
          styles.counter,
          length > maxLength ? styles.counterOver : length > maxLength * 0.9 ? styles.counterNear : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Not announced on every keystroke — that would be unusable. The
            maxLength attribute is the enforcement; this is a visual aid. */}
        <span aria-hidden="true">
          {length}/{maxLength}
        </span>
      </span>
    ) : undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <div
        className={[styles.shell, error ? styles.shellInvalid : '', disabled ? styles.shellDisabled : '']
          .filter(Boolean)
          .join(' ')}
      >
        {icon && (
          <span className={styles.adornment} aria-hidden="true">
            <Icon name={icon} />
          </span>
        )}
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}

        <input
          id={id}
          name={name}
          type={inputType}
          className={styles.control}
          /* A single space, so :placeholder-shown drives the floating label. */
          placeholder=" "
          value={value}
          defaultValue={defaultValue}
          onChange={
            onChange ? (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value) : undefined
          }
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          minLength={minLength}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
          list={list}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(error ? errorId : null, help ? helpId : null)}
        />

        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <>
              <span className={styles.required} aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
          {/* The prefix is visual only; state it in the accessible name too. */}
          {prefix && <span className="sr-only"> (country code {prefix})</span>}
        </label>

        {revealable && (
          <button
            type="button"
            className={styles.trailingButton}
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} />
          </button>
        )}
      </div>

      <FieldMessages error={error} errorId={errorId} help={help} helpId={helpId} counter={counter} />
    </div>
  );
}

/* ==========================================================================
   TextArea
   ========================================================================== */

export interface TextAreaProps extends BaseFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
  placeholder?: string;
  id?: string;
}

export function TextArea({
  label,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  help,
  error,
  required = false,
  disabled = false,
  className,
  rows = 4,
  maxLength,
  showCounter = true,
  id: providedId,
}: TextAreaProps) {
  const generatedId = useId();
  const id = providedId ?? `${name}-${generatedId}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const length = value?.length ?? 0;
  const counter =
    showCounter && maxLength ? (
      <span
        className={[
          styles.counter,
          length > maxLength ? styles.counterOver : length > maxLength * 0.9 ? styles.counterNear : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span aria-hidden="true">
          {length}/{maxLength}
        </span>
      </span>
    ) : undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <div
        className={[styles.shell, error ? styles.shellInvalid : '', disabled ? styles.shellDisabled : '']
          .filter(Boolean)
          .join(' ')}
      >
        <textarea
          id={id}
          name={name}
          className={`${styles.control} ${styles.textarea}`}
          placeholder=" "
          value={value}
          defaultValue={defaultValue}
          onChange={
            onChange ? (event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value) : undefined
          }
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(error ? errorId : null, help ? helpId : null)}
        />
        <label htmlFor={id} className={`${styles.label} ${styles.labelTextarea}`}>
          {label}
          {required && (
            <>
              <span className={styles.required} aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>
      </div>

      <FieldMessages error={error} errorId={errorId} help={help} helpId={helpId} counter={counter} />
    </div>
  );
}

/* ==========================================================================
   SelectField
   ========================================================================== */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends BaseFieldProps {
  options: SelectOption[] | readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Empty-state option text. Rendered as a disabled placeholder option. */
  placeholder?: string;
  id?: string;
}

/**
 * A native <select>.
 *
 * Deliberately native rather than a custom listbox: on mobile it opens the OS
 * picker (far better than any web imitation), it works with every screen reader
 * and switch device without us reimplementing keyboard semantics, and it needs no
 * JavaScript. For long, searchable lists use `SearchableSelect` instead.
 */
export function SelectField({
  label,
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select…',
  help,
  error,
  required = false,
  disabled = false,
  className,
  icon,
  id: providedId,
}: SelectFieldProps) {
  const generatedId = useId();
  const id = providedId ?? `${name}-${generatedId}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  // The label floats whenever a real value is chosen. Tracked here because
  // :placeholder-shown does not apply to <select>.
  const hasValue = value !== undefined ? value !== '' : defaultValue !== undefined && defaultValue !== '';

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <div
        className={[styles.shell, error ? styles.shellInvalid : '', disabled ? styles.shellDisabled : '']
          .filter(Boolean)
          .join(' ')}
      >
        {icon && (
          <span className={styles.adornment} aria-hidden="true">
            <Icon name={icon} />
          </span>
        )}

        <select
          id={id}
          name={name}
          className={`${styles.control} ${styles.select}`}
          value={value}
          defaultValue={defaultValue}
          onChange={
            onChange ? (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value) : undefined
          }
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(error ? errorId : null, help ? helpId : null)}
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor={id} className={[styles.label, hasValue ? styles.labelFloated : ''].join(' ')}>
          {label}
          {required && (
            <>
              <span className={styles.required} aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>

        <span className={styles.chevron} aria-hidden="true">
          <Icon name="chevron-down" />
        </span>
      </div>

      <FieldMessages error={error} errorId={errorId} help={help} helpId={helpId} />
    </div>
  );
}

/* ==========================================================================
   Grouping
   ========================================================================== */

/**
 * A real <fieldset>/<legend>.
 *
 * Use this for any set of related controls (a radio group, a pair of range
 * inputs, an address block). It is what tells a screen reader "these three things
 * belong together and here is what they are for" — a styled <div> with a heading
 * does not.
 */
export function FieldGroup({
  legend,
  help,
  children,
  className,
}: {
  legend: string;
  help?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={[styles.group, className].filter(Boolean).join(' ')}>
      <legend className={styles.legend}>
        {legend}
        {help && <span className={styles.legendHelp}>{help}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

/** Two (or more) fields side by side, stacking below ~210px per column. */
export function FieldRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.row, className].filter(Boolean).join(' ')}>{children}</div>;
}

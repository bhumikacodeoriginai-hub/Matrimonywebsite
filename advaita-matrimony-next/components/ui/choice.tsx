'use client';

/**
 * Choice controls: Segmented, OptionCard(Group), Switch, Checkbox.
 *
 * Every one of these wraps a NATIVE radio or checkbox. The input is visually
 * hidden (but focusable and present in the accessibility tree) and the visible
 * surface is its <label>, styled from the input's state via `:has()`.
 *
 * That choice is deliberate. Rolling these as `role="radio"` divs means owning
 * arrow-key navigation, roving tabindex, form participation and a long tail of
 * screen-reader differences. The native controls already do all of it correctly,
 * and they keep working if our CSS or JS fails.
 *
 * `:has()` has a documented fallback in choice.module.css: where it is
 * unsupported, the real inputs become visible rather than leaving selection
 * invisible.
 */

import { useId, type ReactNode } from 'react';
import { Icon, type IconName } from './icon';
import styles from './choice.module.css';

/* ==========================================================================
   Segmented control
   ========================================================================== */

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export interface SegmentedProps<T extends string> {
  /** Accessible name for the group. Required — a bare row of radios is opaque. */
  label: string;
  name?: string;
  options: SegmentedOption<T>[] | readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Stretch to fill the container. */
  full?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Segmented<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
  full = false,
  className,
  disabled = false,
}: SegmentedProps<T>) {
  const generatedId = useId();
  const groupName = name ?? `segmented-${generatedId}`;

  return (
    <div
      className={[styles.segmented, full ? styles.segmentedFull : '', className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={label}
    >
      {options.map((option) => (
        <label key={option.value} className={styles.segment}>
          <input
            className={styles.input}
            type="radio"
            name={groupName}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
          />
          {option.icon && <Icon name={option.icon} />}
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

/* ==========================================================================
   Option cards
   ========================================================================== */

export interface OptionCardItem<T extends string> {
  value: T;
  title: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
}

interface OptionCardGroupBase<T extends string> {
  /** Rendered as a <legend>, so it names the group for assistive tech. */
  legend: string;
  help?: string;
  options: OptionCardItem<T>[] | readonly OptionCardItem<T>[];
  name?: string;
  /** Minimum column width before the grid wraps. */
  minWidth?: number;
  className?: string;
  error?: string;
}

export interface SingleOptionCardGroupProps<T extends string> extends OptionCardGroupBase<T> {
  multiple?: false;
  value: T | null;
  onChange: (value: T) => void;
}

export interface MultiOptionCardGroupProps<T extends string> extends OptionCardGroupBase<T> {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
}

export type OptionCardGroupProps<T extends string> =
  SingleOptionCardGroupProps<T> | MultiOptionCardGroupProps<T>;

/**
 * A grid of large, tappable choices.
 *
 * `multiple` switches between radio and checkbox semantics — including the
 * indicator shape, since a square vs round indicator is the conventional signal
 * for "many" vs "one" and members read it without being told.
 */
export function OptionCardGroup<T extends string>(props: OptionCardGroupProps<T>) {
  const { legend, help, options, name, minWidth = 220, className, error } = props;
  const generatedId = useId();
  const groupName = name ?? `options-${generatedId}`;
  const errorId = `${groupName}-error`;

  const isMultiple = props.multiple === true;
  const selectedValues: T[] = isMultiple ? props.value : props.value === null ? [] : [props.value];

  const toggle = (value: T) => {
    if (props.multiple) {
      const next = props.value.includes(value)
        ? props.value.filter((item) => item !== value)
        : [...props.value, value];
      props.onChange(next);
    } else {
      props.onChange(value);
    }
  };

  return (
    <fieldset
      className={className}
      style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
      aria-describedby={error ? errorId : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend
        style={{
          padding: 0,
          marginBottom: 'var(--space-3)',
          color: 'var(--text)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-bold)',
        }}
      >
        {legend}
        {help && (
          <span
            style={{
              display: 'block',
              marginTop: 'var(--space-1)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-normal)',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            {help}
          </span>
        )}
      </legend>

      <div className={styles.optionGrid} style={{ ['--option-min' as string]: `${minWidth}px` }}>
        {options.map((option) => {
          const checked = selectedValues.includes(option.value);
          return (
            <label key={option.value} className={styles.option}>
              <input
                className={styles.input}
                type={isMultiple ? 'checkbox' : 'radio'}
                name={groupName}
                value={option.value}
                checked={checked}
                onChange={() => toggle(option.value)}
                disabled={option.disabled}
              />
              {option.icon ? (
                <span className={styles.optionIcon} aria-hidden="true">
                  <Icon name={option.icon} />
                </span>
              ) : (
                /* Keeps the three-column grid aligned when some options have no
                   icon — an empty cell rather than a collapsed layout. */
                <span aria-hidden="true" />
              )}

              <span className={styles.optionBody}>
                <span className={styles.optionTitle}>{option.title}</span>
                {option.description && <span className={styles.optionDescription}>{option.description}</span>}
              </span>

              <span
                className={[styles.optionCheck, isMultiple ? styles.optionCheckSquare : ''].join(' ')}
                aria-hidden="true"
              >
                <Icon name="check" />
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: 'var(--space-2) 0 0',
            color: 'var(--danger)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}

/* ==========================================================================
   Switch
   ========================================================================== */

export interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * An immediate on/off setting.
 *
 * Only use a switch where the change takes effect at once. If the member has to
 * press Save afterwards, it is a checkbox — switches that need confirming are one
 * of the most common sources of "did that save?" confusion.
 */
export function Switch({ label, description, checked, onChange, name, disabled, className }: SwitchProps) {
  const generatedId = useId();
  const descriptionId = description ? `switch-${generatedId}-description` : undefined;

  return (
    <label className={[styles.switchRow, className].filter(Boolean).join(' ')}>
      <input
        className={styles.input}
        type="checkbox"
        role="switch"
        name={name}
        checked={checked}
        onChange={(event: { target: { checked: boolean } }) => onChange(event.target.checked)}
        disabled={disabled}
        aria-describedby={descriptionId}
      />
      <span className={styles.switchText}>
        <span className={styles.switchTitle}>{label}</span>
        {description && (
          <span className={styles.switchDescription} id={descriptionId}>
            {description}
          </span>
        )}
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </label>
  );
}

/* ==========================================================================
   Checkbox
   ========================================================================== */

export interface CheckboxProps {
  /** Accepts nodes so consent copy can contain links. */
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  /** Larger, higher-contrast label for list-style multi-selects. */
  strong?: boolean;
  className?: string;
}

export function Checkbox({
  label,
  checked,
  onChange,
  name,
  required,
  disabled,
  error,
  strong = false,
  className,
}: CheckboxProps) {
  const generatedId = useId();
  const errorId = error ? `checkbox-${generatedId}-error` : undefined;

  return (
    <div>
      <label className={[styles.checkRow, className].filter(Boolean).join(' ')}>
        <input
          className={styles.input}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event: { target: { checked: boolean } }) => onChange(event.target.checked)}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
        />
        <span className={styles.box} aria-hidden="true">
          <Icon name="check" />
        </span>
        <span className={strong ? styles.checkLabelStrong : styles.checkLabel}>{label}</span>
      </label>
      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: '0 0 0 calc(21px + var(--space-3))',
            color: 'var(--danger)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

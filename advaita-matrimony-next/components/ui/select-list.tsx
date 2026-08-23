'use client';

/**
 * SearchableCheckList and TagInput.
 *
 * WHY NOT A COMBOBOX
 * ------------------
 * The obvious component for "pick several states from 32" is an ARIA combobox
 * with a popup listbox. It is also one of the hardest patterns to get right:
 * `aria-activedescendant`, virtual focus, announcing filtered result counts,
 * differing NVDA/JAWS/VoiceOver behaviour, and a popup that has to be dismissed
 * correctly on mobile.
 *
 * A search box that FILTERS AN ALWAYS-VISIBLE list of real checkboxes does the
 * same job with native semantics: every option is a labelled checkbox, arrow keys
 * and Tab behave normally, and the filtered count is announced through one polite
 * live region. It is less fashionable and considerably more reliable.
 *
 * For single-choice fields, use `SelectField` (a native <select>) — on mobile that
 * opens the OS picker, which beats anything we could build.
 */

import { useId, useMemo, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Icon } from './icon';
import { Chip } from './badge';
import styles from './select-list.module.css';

/* ==========================================================================
   SearchableCheckList
   ========================================================================== */

export interface SearchableCheckListProps {
  label: string;
  help?: string;
  /** Full option set. Filtering happens client-side. */
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Search only appears above this many options — below it, it is just noise. */
  searchThreshold?: number;
  searchPlaceholder?: string;
  /** Max height of the scrolling list. */
  maxHeight?: number;
  /** Shows the current selection as removable chips above the list. */
  showSelected?: boolean;
  className?: string;
}

export function SearchableCheckList({
  label,
  help,
  options,
  value,
  onChange,
  searchThreshold = 8,
  searchPlaceholder = 'Type to filter…',
  maxHeight = 264,
  showSelected = true,
  className,
}: SearchableCheckListProps) {
  const id = useId();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, query]);

  const toggle = (option: string) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  };

  const showSearch = options.length >= searchThreshold;

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <span className={styles.label} id={`${id}-label`}>
          {label}
        </span>
        {value.length > 0 && (
          <span className={styles.count}>
            {value.length} selected
            <button
              type="button"
              className="inline-control"
              onClick={() => onChange([])}
              style={{
                marginLeft: 'var(--space-2)',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-2xs)',
                fontWeight: 'var(--weight-bold)',
                textDecoration: 'underline',
              }}
            >
              Clear
            </button>
          </span>
        )}
      </div>

      {help && <p className={styles.help}>{help}</p>}

      {showSelected && value.length > 0 && (
        <div className={styles.selected}>
          {value.map((item) => (
            <Chip key={item} onRemove={() => toggle(item)} removeLabel={`Remove ${item}`}>
              {item}
            </Chip>
          ))}
        </div>
      )}

      {showSearch && (
        <div className={styles.search}>
          <span className={styles.searchIcon} aria-hidden="true">
            <Icon name="search" />
          </span>
          <input
            className={styles.searchInput}
            type="text"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={`Filter ${label.toLowerCase()}`}
            aria-describedby={`${id}-status`}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className={styles.clear}
              onClick={() => setQuery('')}
              aria-label="Clear filter"
            >
              <Icon name="close" />
            </button>
          )}
        </div>
      )}

      {/* One polite announcement of the filtered count, so a screen reader user
          knows the list changed without every keystroke being read out. */}
      <span id={`${id}-status`} className="sr-only" role="status" aria-live="polite">
        {query ? `${filtered.length} of ${options.length} options match` : `${options.length} options`}
      </span>

      <div
        className={styles.list}
        style={{ ['--list-height' as string]: `${maxHeight}px` }}
        role="group"
        aria-labelledby={`${id}-label`}
      >
        {filtered.length === 0 ? (
          <p className={styles.noResults}>No matches for “{query}”.</p>
        ) : (
          filtered.map((option) => {
            const checked = value.includes(option);
            return (
              <label
                key={option}
                className={[styles.row, checked ? styles.rowSelected : ''].filter(Boolean).join(' ')}
              >
                <input
                  className={styles.checkInput}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option)}
                />
                <span className={styles.box} aria-hidden="true">
                  <Icon name="check" />
                </span>
                <span className={styles.rowLabel}>{option}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   TagInput
   ========================================================================== */

export interface TagInputProps {
  label: string;
  help?: string;
  value: string[];
  onChange: (value: string[]) => void;
  /** One-tap chips for common answers. */
  suggestions?: readonly string[];
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

/**
 * Free-text tags with suggestions — for hobbies and languages, which the API
 * stores as JSON arrays.
 *
 * Enter and comma both commit a tag; Backspace on an empty input removes the last
 * one. Every existing tag is a removable chip with its own button, so the whole
 * control is operable from the keyboard without any custom key handling beyond
 * those two conveniences.
 */
export function TagInput({
  label,
  help,
  value,
  onChange,
  suggestions,
  placeholder = 'Type and press Enter',
  maxTags = 12,
  className,
}: TagInputProps) {
  const id = useId();
  const [draft, setDraft] = useState('');

  const atLimit = value.length >= maxTags;

  const add = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, ' ');
    if (!tag || atLimit) return;
    // Case-insensitive de-duplication: "Reading" and "reading" are one tag.
    if (value.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const remove = (tag: string) => onChange(value.filter((item) => item !== tag));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      // Enter must not submit the surrounding wizard form.
      event.preventDefault();
      add(draft);
      return;
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      remove(value[value.length - 1]!);
    }
  };

  const unusedSuggestions = (suggestions ?? []).filter(
    (suggestion) => !value.some((item) => item.toLowerCase() === suggestion.toLowerCase()),
  );

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        <span className={styles.count}>
          {value.length}/{maxTags}
        </span>
      </div>

      {help && <p className={styles.help}>{help}</p>}

      {value.length > 0 && (
        <div className={styles.selected}>
          {value.map((tag) => (
            <Chip key={tag} onRemove={() => remove(tag)} removeLabel={`Remove ${tag}`}>
              {tag}
            </Chip>
          ))}
        </div>
      )}

      <div className={styles.tagRow}>
        <div className={styles.search}>
          <input
            id={id}
            className={styles.searchInput}
            type="text"
            value={draft}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={atLimit ? `Maximum ${maxTags} reached` : placeholder}
            disabled={atLimit}
            autoComplete="off"
            aria-describedby={`${id}-status`}
          />
        </div>
        <button
          type="button"
          onClick={() => add(draft)}
          disabled={!draft.trim() || atLimit}
          aria-label={`Add ${draft.trim() || 'tag'}`}
          style={{
            flex: '0 0 auto',
            width: 44,
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--brand-text)',
          }}
        >
          <Icon name="plus" />
        </button>
      </div>

      <span id={`${id}-status`} className="sr-only" role="status" aria-live="polite">
        {value.length} of {maxTags} added.
      </span>

      {unusedSuggestions.length > 0 && !atLimit && (
        <div className={styles.suggestions}>
          <span className={styles.suggestionsLabel}>Suggestions</span>
          {unusedSuggestions.slice(0, 12).map((suggestion) => (
            <Chip key={suggestion} onSelect={() => add(suggestion)} icon="plus">
              {suggestion}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

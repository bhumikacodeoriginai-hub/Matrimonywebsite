/**
 * Page header for authenticated pages, plus a shared pager.
 *
 * Server Components — pure markup, no client JavaScript.
 *
 * The `<h1>` lives here rather than in the topbar. The topbar's label is
 * navigational chrome (a `<p>`), so every page has exactly one top-level heading
 * and the document outline stays correct as the member moves around.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '../ui/icon';
import styles from './member.module.css';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </header>
  );
}

/**
 * Link-based pagination.
 *
 * Real `<a href>`s rather than buttons, so the page number lives in the URL:
 * shareable, bookmarkable, survives a reload, and works without JavaScript. Every
 * paginated endpoint here returns a Laravel paginator, so we always know the
 * bounds.
 */
export function Pager({
  currentPage,
  lastPage,
  total,
  /** Base path; the page number is appended as `?page=`. */
  basePath,
  /** Extra query string to preserve (filters), without a leading `?`. */
  query = '',
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  basePath: string;
  query?: string;
}) {
  if (lastPage <= 1) return null;

  const href = (page: number) => {
    const params = new URLSearchParams(query);
    params.set('page', String(page));
    return `${basePath}?${params.toString()}`;
  };

  const linkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    padding: '0 var(--space-4)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface)',
    color: 'var(--brand-text)',
    fontSize: 'var(--text-sm)',
    fontWeight: 700,
    textDecoration: 'none',
  };

  const disabledStyle: React.CSSProperties = {
    ...linkStyle,
    color: 'var(--text-muted)',
    opacity: 0.55,
    pointerEvents: 'none',
  };

  return (
    <nav className={styles.pager} aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} style={linkStyle} rel="prev">
          <Icon name="chevron-left" /> Previous
        </Link>
      ) : (
        <span style={disabledStyle} aria-hidden="true">
          <Icon name="chevron-left" /> Previous
        </span>
      )}

      <p className={styles.pagerInfo} aria-live="polite">
        Page {currentPage} of {lastPage} · {total} total
      </p>

      {currentPage < lastPage ? (
        <Link href={href(currentPage + 1)} style={linkStyle} rel="next">
          Next <Icon name="chevron-right" />
        </Link>
      ) : (
        <span style={disabledStyle} aria-hidden="true">
          Next <Icon name="chevron-right" />
        </span>
      )}
    </nav>
  );
}

/** Small "N results" line above a list. */
export function ResultBar({
  count,
  label,
  children,
}: {
  count: number;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.resultBar}>
      <p className={styles.resultCount} role="status" aria-live="polite">
        <strong>{count}</strong> {label}
      </p>
      {children}
    </div>
  );
}

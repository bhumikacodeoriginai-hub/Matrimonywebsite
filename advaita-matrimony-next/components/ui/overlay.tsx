'use client';

/**
 * Overlays: Modal, Sheet, Drawer and ConfirmDialog.
 *
 * All four are the same component with a different panel shape, and all four get
 * the full dialog contract from `useDialog`: focus moves in on open and returns to
 * the trigger on close, Tab is trapped, Escape closes, background scroll is locked
 * without shifting, and the rest of the page is made `inert`.
 *
 * Rendered inline in the tree rather than through a portal. With `position: fixed`
 * and the z-index scale from tokens.css there is nothing for a portal to solve
 * here, and staying in the tree means React context (toasts, theme) keeps working
 * inside the panel.
 *
 * The scrim closes on click, but only when the click STARTED on the scrim —
 * otherwise a text selection that happens to end outside the panel would dismiss
 * a form the member was filling in.
 */

import { useRef, type ReactNode } from 'react';
import { useDialog } from '../../lib/hooks/use-dialog';
import { Icon } from './icon';
import styles from './overlay.module.css';

type OverlayShape = 'modal' | 'sheet' | 'drawer';

interface OverlayBaseProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Buttons for the sticky footer. */
  footer?: ReactNode;
  /** Pushes footer content apart (e.g. "Clear all" ⟷ "Apply"). */
  footerSpread?: boolean;
  /** Removes body padding, for full-bleed content such as a photo gallery. */
  flush?: boolean;
  /** Width for modal/drawer. Ignored by sheet. */
  width?: number;
  /** Hides the visible title, keeping it as the accessible name only. */
  hideTitle?: boolean;
  className?: string;
}

function Overlay({
  shape,
  open,
  onClose,
  title,
  description,
  children,
  footer,
  footerSpread,
  flush,
  width,
  hideTitle,
  className,
}: OverlayBaseProps & { shape: OverlayShape }) {
  const { ref } = useDialog<HTMLDivElement>(open, onClose);
  /** Where the current pointer interaction began — see the note above. */
  const pressedScrim = useRef(false);

  if (!open) return null;

  const scrimClass = [
    styles.scrim,
    shape === 'sheet' ? styles.scrimBottom : shape === 'drawer' ? styles.scrimRight : styles.scrimCenter,
  ].join(' ');

  const panelClass = [styles.panel, styles[shape], className].filter(Boolean).join(' ');

  const titleId = `overlay-title-${shape}-${title.replace(/\W+/g, '-').toLowerCase()}`;
  const descriptionId = description ? `${titleId}-description` : undefined;

  return (
    <div
      className={scrimClass}
      onMouseDown={(event: { target: unknown; currentTarget: unknown }) => {
        pressedScrim.current = event.target === event.currentTarget;
      }}
      onMouseUp={(event: { target: unknown; currentTarget: unknown }) => {
        if (pressedScrim.current && event.target === event.currentTarget) onClose();
        pressedScrim.current = false;
      }}
    >
      <div
        ref={ref}
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        // Focusable so `useDialog` can move focus here when there is no field.
        tabIndex={-1}
        style={
          width
            ? ({
                ['--modal-width' as string]: `${width}px`,
                ['--drawer-width' as string]: `${width}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {shape === 'sheet' && (
          <div className={styles.grabber} aria-hidden="true">
            <span className={styles.grabberBar} />
          </div>
        )}

        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 id={titleId} className={hideTitle ? 'sr-only' : styles.title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <div className={[styles.body, flush ? styles.bodyFlush : ''].filter(Boolean).join(' ')}>
          {children}
        </div>

        {footer && (
          <div className={[styles.foot, footerSpread ? styles.footSpread : ''].filter(Boolean).join(' ')}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Centred dialog. Becomes a bottom sheet below 560px (see the stylesheet). */
export function Modal(props: OverlayBaseProps) {
  return <Overlay shape="modal" {...props} />;
}

/** Bottom sheet. The right shape for mobile filters and pickers. */
export function Sheet(props: OverlayBaseProps) {
  return <Overlay shape="sheet" {...props} />;
}

/** Right-hand drawer. Used for desktop filters and the notification centre. */
export function Drawer(props: OverlayBaseProps) {
  return <Overlay shape="drawer" {...props} />;
}

/* ==========================================================================
   ConfirmDialog
   ========================================================================== */

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** Say plainly what will happen, including anything irreversible. */
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  destructive?: boolean;
  pending?: boolean;
}

/**
 * Confirmation for irreversible actions.
 *
 * Cancel is focused first, not Confirm. For a destructive action the safe choice
 * should be the one a reflexive Enter press lands on.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width={440}
      footer={
        <>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            disabled={pending}
            style={{
              padding: 'var(--space-3) var(--space-5)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-bold)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            aria-busy={pending || undefined}
            style={{
              padding: 'var(--space-3) var(--space-5)',
              border: destructive ? '1px solid var(--danger)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              background: destructive ? 'var(--danger-soft)' : 'var(--action-bg)',
              color: destructive ? 'var(--danger)' : 'var(--action-fg)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-bold)',
            }}
          >
            {pending ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <p
        style={{
          margin: 0,
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          lineHeight: 'var(--leading-relaxed)',
        }}
      >
        {body}
      </p>
    </Modal>
  );
}

'use client';

import { useEffect, useRef } from 'react';

/** Elements that can hold focus inside a dialog. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Everything a modal, drawer or bottom sheet needs to be accessible:
 *
 *  • focus moves into the dialog on open, and back to the trigger on close
 *  • Tab cycles within the dialog (focus trap)
 *  • Escape closes it
 *  • background scroll is locked without the layout shifting
 *  • the rest of the page is hidden from assistive tech via `inert`
 *
 * Returns a ref to attach to the dialog container.
 */
export function useDialog<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void,
): { ref: React.RefObject<T | null> } {
  const ref = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  /* ---- Focus management + key handling ---- */
  useEffect(() => {
    if (!isOpen) return;
    const container = ref.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Prefer an element that explicitly asks for initial focus (e.g. the first
    // field); otherwise focus the container itself so screen readers announce it.
    const preferred = container.querySelector<HTMLElement>('[data-autofocus]');
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    (preferred ?? focusables[0] ?? container).focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      // Re-query every time: dialog contents change (steps, conditional fields).
      const current = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );
      if (current.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = current[0]!;
      const last = current[current.length - 1]!;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      // Returning focus is what makes keyboard use feel unbroken.
      previouslyFocused.current?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  /* ---- Scroll lock ---- */
  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // Compensate for the removed scrollbar so the page does not jump sideways.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  /* ---- Hide the rest of the page from assistive tech ---- */
  useEffect(() => {
    if (!isOpen) return;
    const container = ref.current;
    if (!container) return;

    // `inert` removes siblings from the a11y tree and from tab order, which is
    // stronger and less error-prone than aria-hidden alone.
    const siblings = Array.from(document.body.children).filter(
      (child) => child !== container && !child.contains(container),
    ) as HTMLElement[];

    const previous = siblings.map((element) => element.hasAttribute('inert'));
    siblings.forEach((element) => element.setAttribute('inert', ''));

    return () => {
      siblings.forEach((element, index) => {
        if (!previous[index]) element.removeAttribute('inert');
      });
    };
  }, [isOpen]);

  return { ref };
}

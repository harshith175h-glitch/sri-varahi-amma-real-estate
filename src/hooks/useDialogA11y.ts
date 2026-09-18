import { useEffect, useRef } from 'react';

export interface DialogA11yOptions {
  /** Whether the dialog is currently open. */
  isOpen: boolean;
  /** Called on Escape and on backdrop activation. */
  onClose: () => void;
  /** Prevent the page behind the dialog from scrolling. Default: true. */
  lockScroll?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Accessibility behaviour every modal in this app needs:
 *   • Escape closes the dialog
 *   • Tab / Shift+Tab are trapped inside the dialog
 *   • focus moves into the dialog on open and returns to the trigger on close
 *   • the page behind does not scroll
 *
 * Attach the returned ref to the dialog's outermost overlay element and add
 * `role="dialog" aria-modal="true"` to it.
 */
export function useDialogA11y<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  lockScroll = true,
}: DialogA11yOptions) {
  const ref = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] => {
      const node = ref.current as HTMLElement | null;
      if (!node) return [];
      const found = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      return Array.from(found).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
    };

    // Move focus into the dialog (first control, else the dialog itself).
    const focusTimer = window.setTimeout(() => {
      const node = ref.current;
      if (!node) return;
      const focusable = getFocusable();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        node.setAttribute('tabindex', '-1');
        node.focus();
      }
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      const node = ref.current;
      if (!node || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (active === first || active === node)) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (lockScroll) document.body.style.overflow = previousOverflow;
      // Return focus to whatever opened the dialog.
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, lockScroll]);

  return ref;
}

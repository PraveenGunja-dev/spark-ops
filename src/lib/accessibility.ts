/**
 * Accessibility Utilities
 * Helpers for improving keyboard navigation and screen reader support
 */

/**
 * Focus trap for modals and dialogs
 * Keeps focus within a container element
 */
export class FocusTrap {
  private container: HTMLElement;
  private previousFocus: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Activate the focus trap
   */
  activate(): void {
    this.previousFocus = document.activeElement as HTMLElement;
    this.updateFocusableElements();
    this.focusFirst();
    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Deactivate the focus trap and restore previous focus
   */
  deactivate(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }

  private updateFocusableElements(): void {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(selector)
    ) as HTMLElement[];
  }

  private focusFirst(): void {
    if (this.focusableElements.length > 0) {
      this.focusableElements[0]?.focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const { length } = this.focusableElements;
    if (length === 0) return;

    const currentIndex = this.focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (currentIndex === 0) {
        event.preventDefault();
        this.focusableElements[length - 1]?.focus();
      }
    } else {
      // Tab (forwards)
      if (currentIndex === length - 1) {
        event.preventDefault();
        this.focusableElements[0]?.focus();
      }
    }
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  return !element.hasAttribute('aria-hidden') || element.getAttribute('aria-hidden') === 'false';
}

/**
 * Generate unique ID for accessibility attributes
 */
let idCounter = 0;
export function generateId(prefix = 'a11y'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Keyboard navigation helper
 * Handle arrow key navigation in lists
 */
export function handleArrowKeyNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    orientation?: 'vertical' | 'horizontal';
    loop?: boolean;
  } = {}
): number {
  const { orientation = 'vertical', loop = true } = options;
  const { length } = items;

  const isNext =
    (orientation === 'vertical' && event.key === 'ArrowDown') ||
    (orientation === 'horizontal' && event.key === 'ArrowRight');

  const isPrevious =
    (orientation === 'vertical' && event.key === 'ArrowUp') ||
    (orientation === 'horizontal' && event.key === 'ArrowLeft');

  if (!isNext && !isPrevious) {
    return currentIndex;
  }

  event.preventDefault();

  let newIndex = currentIndex;

  if (isNext) {
    newIndex = currentIndex + 1;
    if (newIndex >= length) {
      newIndex = loop ? 0 : length - 1;
    }
  } else if (isPrevious) {
    newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = loop ? length - 1 : 0;
    }
  }

  items[newIndex]?.focus();
  return newIndex;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Skip to content link helper
 */
export function createSkipLink(targetId: string, text = 'Skip to main content'): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded';
  
  return skipLink;
}

/**
 * Add skip link to page
 */
export function addSkipLink(targetId = 'main-content'): void {
  const skipLink = createSkipLink(targetId);
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Validate ARIA attributes
 */
export function validateAriaAttributes(element: HTMLElement): string[] {
  const errors: string[] = [];

  // Check if aria-labelledby references exist
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const ids = labelledBy.split(' ');
    ids.forEach((id) => {
      if (!document.getElementById(id)) {
        errors.push(`aria-labelledby references non-existent ID: ${id}`);
      }
    });
  }

  // Check if aria-describedby references exist
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const ids = describedBy.split(' ');
    ids.forEach((id) => {
      if (!document.getElementById(id)) {
        errors.push(`aria-describedby references non-existent ID: ${id}`);
      }
    });
  }

  // Check for invalid role
  const role = element.getAttribute('role');
  const validRoles = [
    'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
    'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
    'contentinfo', 'definition', 'dialog', 'directory', 'document', 'feed',
    'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link',
    'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
    'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
    'none', 'note', 'option', 'presentation', 'progressbar', 'radio',
    'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
    'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status',
    'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
    'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem',
  ];

  if (role && !validRoles.includes(role)) {
    errors.push(`Invalid ARIA role: ${role}`);
  }

  return errors;
}

/**
 * Ensure element has accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent?.trim() ||
    (element as HTMLInputElement).placeholder
  );
}

/**
 * Add accessible name if missing
 */
export function ensureAccessibleName(element: HTMLElement, fallbackName: string): void {
  if (!hasAccessibleName(element)) {
    element.setAttribute('aria-label', fallbackName);
  }
}

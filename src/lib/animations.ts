/**
 * Animation Utilities
 * Simple, performance-focused animations
 * Note: Respects user's preference for reduced motion
 */

import { prefersReducedMotion } from './accessibility';

/**
 * Easing functions for smooth animations
 */
export const easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
} as const;

/**
 * Simple fade in animation
 */
export function fadeIn(
  element: HTMLElement,
  duration = 300,
  easingFunc: (t: number) => number = easing.easeOutQuad
): Promise<void> {
  if (prefersReducedMotion()) {
    element.style.opacity = '1';
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    element.style.opacity = '0';
    const start = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunc(progress);

      element.style.opacity = String(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

/**
 * Simple fade out animation
 */
export function fadeOut(
  element: HTMLElement,
  duration = 300,
  easingFunc: (t: number) => number = easing.easeInQuad
): Promise<void> {
  if (prefersReducedMotion()) {
    element.style.opacity = '0';
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const start = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunc(progress);

      element.style.opacity = String(1 - easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

/**
 * Slide in animation
 */
export function slideIn(
  element: HTMLElement,
  direction: 'top' | 'right' | 'bottom' | 'left' = 'bottom',
  duration = 300
): Promise<void> {
  if (prefersReducedMotion()) {
    element.style.transform = 'translate(0, 0)';
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const distance = 20; // px
    const start = performance.now();

    const initialTransform = {
      top: `translateY(-${distance}px)`,
      right: `translateX(${distance}px)`,
      bottom: `translateY(${distance}px)`,
      left: `translateX(-${distance}px)`,
    }[direction];

    element.style.transform = initialTransform;

    function animate(currentTime: number) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing.easeOutCubic(progress);

      const currentDistance = distance * (1 - easedProgress);
      const transform = {
        top: `translateY(-${currentDistance}px)`,
        right: `translateX(${currentDistance}px)`,
        bottom: `translateY(${currentDistance}px)`,
        left: `translateX(-${currentDistance}px)`,
      }[direction];

      element.style.transform = transform;
      element.style.opacity = String(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.transform = 'translate(0, 0)';
        element.style.opacity = '1';
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

/**
 * Scale animation (for emphasis)
 */
export function scale(
  element: HTMLElement,
  from = 0.95,
  to = 1,
  duration = 200
): Promise<void> {
  if (prefersReducedMotion()) {
    element.style.transform = `scale(${to})`;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const start = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing.easeOutCubic(progress);

      const currentScale = from + (to - from) * easedProgress;
      element.style.transform = `scale(${currentScale})`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.transform = `scale(${to})`;
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(
  targetElement: HTMLElement | string,
  options: {
    offset?: number;
    duration?: number;
    onComplete?: () => void;
  } = {}
): void {
  const { offset = 0, duration = 500, onComplete } = options;

  const element =
    typeof targetElement === 'string'
      ? document.querySelector(targetElement)
      : targetElement;

  if (!element) return;

  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;

  if (prefersReducedMotion() || distance === 0) {
    window.scrollTo(0, targetPosition);
    onComplete?.();
    return;
  }

  const start = performance.now();

  function animate(currentTime: number) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing.easeInOutCubic(progress);

    window.scrollTo(0, startPosition + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(animate);
}

/**
 * Stagger animation for lists
 */
export async function staggerAnimation(
  elements: HTMLElement[],
  animationFn: (element: HTMLElement) => Promise<void>,
  delay = 50
): Promise<void> {
  if (prefersReducedMotion()) {
    // Run all animations immediately
    await Promise.all(elements.map((el) => animationFn(el)));
    return;
  }

  // Run animations with stagger delay
  for (let i = 0; i < elements.length; i++) {
    await animationFn(elements[i] as HTMLElement);
    if (i < elements.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Pulse animation (for notifications)
 */
export function pulse(element: HTMLElement, count = 2, duration = 300): Promise<void> {
  if (prefersReducedMotion()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let currentCount = 0;
    const originalOpacity = element.style.opacity || '1';

    function runPulse() {
      const start = performance.now();

      function animate(currentTime: number) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Pulse: 1 -> 0.7 -> 1
        const opacity = 1 - 0.3 * Math.sin(progress * Math.PI);
        element.style.opacity = String(opacity);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          currentCount++;
          if (currentCount < count) {
            runPulse();
          } else {
            element.style.opacity = originalOpacity;
            resolve();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    runPulse();
  });
}

/**
 * Height auto animation (for expand/collapse)
 */
export function animateHeight(
  element: HTMLElement,
  targetHeight: number | 'auto',
  duration = 300
): Promise<void> {
  if (prefersReducedMotion()) {
    element.style.height = typeof targetHeight === 'number' ? `${targetHeight}px` : 'auto';
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const startHeight = element.offsetHeight;
    const endHeight =
      targetHeight === 'auto'
        ? element.scrollHeight
        : targetHeight;

    const start = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing.easeInOutCubic(progress);

      const currentHeight = startHeight + (endHeight - startHeight) * easedProgress;
      element.style.height = `${currentHeight}px`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.height = targetHeight === 'auto' ? 'auto' : `${targetHeight}px`;
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

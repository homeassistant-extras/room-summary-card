/**
 * Updates scroll indicators based on container scroll position
 * @param container - The scrollable container element
 * @returns Object with showLeftScroll and showRightScroll boolean values
 */
export function updateScrollIndicators(
  container: HTMLDivElement | null | undefined,
): { showLeftScroll: boolean; showRightScroll: boolean } {
  if (!container) {
    return { showLeftScroll: false, showRightScroll: false };
  }

  const { scrollLeft, scrollWidth, clientWidth } = container;

  // Show left indicator if scrolled right
  const showLeftScroll = scrollLeft > 5;

  // Show right indicator if there's more content to the right
  const showRightScroll = scrollLeft < scrollWidth - clientWidth - 5;

  return { showLeftScroll, showRightScroll };
}

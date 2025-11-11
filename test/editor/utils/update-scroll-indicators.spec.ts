import { updateScrollIndicators } from '@/editor/utils/update-scroll-indicators';
import { expect } from 'chai';

describe('update-scroll-indicators.ts', () => {
  describe('updateScrollIndicators', () => {
    it('should return false for both indicators when container is null', () => {
      const result = updateScrollIndicators(null);
      expect(result.showLeftScroll).to.be.false;
      expect(result.showRightScroll).to.be.false;
    });

    it('should return false for both indicators when container is undefined', () => {
      const result = updateScrollIndicators(undefined as any);
      expect(result.showLeftScroll).to.be.false;
      expect(result.showRightScroll).to.be.false;
    });

    it('should show left indicator when scrolled right', () => {
      const container = {
        scrollLeft: 10,
        scrollWidth: 500,
        clientWidth: 200,
      } as HTMLDivElement;

      const result = updateScrollIndicators(container);
      expect(result.showLeftScroll).to.be.true;
      expect(result.showRightScroll).to.be.true; // Still has more content
    });

    it('should not show left indicator when at start', () => {
      const container = {
        scrollLeft: 0,
        scrollWidth: 500,
        clientWidth: 200,
      } as HTMLDivElement;

      const result = updateScrollIndicators(container);
      expect(result.showLeftScroll).to.be.false;
      expect(result.showRightScroll).to.be.true;
    });

    it('should not show left indicator when scrolled less than 5px', () => {
      const container = {
        scrollLeft: 4,
        scrollWidth: 500,
        clientWidth: 200,
      } as HTMLDivElement;

      const result = updateScrollIndicators(container);
      expect(result.showLeftScroll).to.be.false;
      expect(result.showRightScroll).to.be.true;
    });

    it('should show right indicator when there is more content', () => {
      const container = {
        scrollLeft: 0,
        scrollWidth: 500,
        clientWidth: 200,
      } as HTMLDivElement;

      const result = updateScrollIndicators(container);
      expect(result.showLeftScroll).to.be.false;
      expect(result.showRightScroll).to.be.true;
    });

    it('should not show right indicator when at end', () => {
      const container = {
        scrollLeft: 300, // scrollWidth (500) - clientWidth (200) = 300
        scrollWidth: 500,
        clientWidth: 200,
      } as HTMLDivElement;

      const result = updateScrollIndicators(container);
      expect(result.showLeftScroll).to.be.true;
      expect(result.showRightScroll).to.be.false;
    });

    it('should not show right indicator when within 5px of end', () => {
      const container = {
        scrollLeft: 295, // Just before the threshold
        scrollWidth: 500,
        clientWidth: 200,
      } as HTMLDivElement;

      const result = updateScrollIndicators(container);
      expect(result.showLeftScroll).to.be.true;
      expect(result.showRightScroll).to.be.false;
    });

    it('should show both indicators when in middle', () => {
      const container = {
        scrollLeft: 150,
        scrollWidth: 500,
        clientWidth: 200,
      } as HTMLDivElement;

      const result = updateScrollIndicators(container);
      expect(result.showLeftScroll).to.be.true;
      expect(result.showRightScroll).to.be.true;
    });

    it('should handle container with no scrollable content', () => {
      const container = {
        scrollLeft: 0,
        scrollWidth: 200,
        clientWidth: 200,
      } as HTMLDivElement;

      const result = updateScrollIndicators(container);
      expect(result.showLeftScroll).to.be.false;
      expect(result.showRightScroll).to.be.false;
    });
  });
});


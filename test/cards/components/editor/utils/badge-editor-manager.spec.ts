import type { BadgeConfig } from '@type/config/entity';
import { expect } from 'chai';
import {
  createNewBadge,
  addBadge,
  adjustExpandedIndicesAfterRemoval,
  removeBadgeItem,
} from '../../../../../src/cards/components/editor/utils/badge-editor-manager';

describe('badge-editor-manager', () => {
  describe('createNewBadge', () => {
    it('should create a new badge with default position', () => {
      const badge = createNewBadge();
      expect(badge).to.deep.equal({
        position: 'top_right',
      });
    });

    it('should create a new badge instance each time', () => {
      const badge1 = createNewBadge();
      const badge2 = createNewBadge();
      expect(badge1).to.not.equal(badge2); // Different instances
      expect(badge1).to.deep.equal(badge2); // But same content
    });
  });

  describe('addBadge', () => {
    it('should add new badge to empty array', () => {
      const badges: BadgeConfig[] = [];
      const newBadges = addBadge(badges);
      expect(newBadges).to.have.lengthOf(1);
      expect(newBadges[0]).to.deep.equal({
        position: 'top_right',
      });
    });

    it('should add new badge to existing array', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_left', mode: 'show_always' },
        { position: 'bottom_right', mode: 'if_match' },
      ];
      const newBadges = addBadge(badges);
      expect(newBadges).to.have.lengthOf(3);
      expect(newBadges[0]).to.deep.equal(badges[0]);
      expect(newBadges[1]).to.deep.equal(badges[1]);
      expect(newBadges[2]).to.deep.equal({
        position: 'top_right',
      });
    });

    it('should handle undefined badges array', () => {
      const newBadges = addBadge(undefined);
      expect(newBadges).to.have.lengthOf(1);
      expect(newBadges[0]).to.deep.equal({
        position: 'top_right',
      });
    });

    it('should not mutate original array', () => {
      const badges: BadgeConfig[] = [{ position: 'top_left' }];
      const newBadges = addBadge(badges);
      expect(badges).to.have.lengthOf(1);
      expect(newBadges).to.have.lengthOf(2);
    });
  });

  describe('adjustExpandedIndicesAfterRemoval', () => {
    it('should remove the deleted index from expanded states', () => {
      const expandedBadges = new Set([0, 1, 2]);
      const result = adjustExpandedIndicesAfterRemoval(expandedBadges, 1);
      // Removing index 1:
      // Index 0 stays 0
      // Index 1 is removed
      // Index 2 becomes 1
      expect(result.has(0)).to.be.true; // Unchanged
      expect(result.has(1)).to.be.true; // Was index 2, adjusted to 1
      expect(result.has(2)).to.be.false; // Was removed/adjusted
      expect(result.size).to.equal(2);
    });

    it('should decrement indices greater than removed index', () => {
      const expandedBadges = new Set([0, 2, 3]);
      const result = adjustExpandedIndicesAfterRemoval(expandedBadges, 1);
      // Removing index 1:
      // Index 0 stays 0
      // Index 2 becomes 1
      // Index 3 becomes 2
      expect(result.has(0)).to.be.true; // Before removed index, unchanged
      expect(result.has(1)).to.be.true; // Was index 2
      expect(result.has(2)).to.be.true; // Was index 3
      expect(result.size).to.equal(3);
    });

    it('should keep indices less than removed index unchanged', () => {
      const expandedBadges = new Set([0, 1]);
      const result = adjustExpandedIndicesAfterRemoval(expandedBadges, 2);
      expect(result.has(0)).to.be.true;
      expect(result.has(1)).to.be.true;
    });

    it('should handle empty expanded states', () => {
      const expandedBadges = new Set<number>();
      const result = adjustExpandedIndicesAfterRemoval(expandedBadges, 0);
      expect(result.size).to.equal(0);
    });

    it('should handle removing first index', () => {
      const expandedBadges = new Set([0, 1, 2]);
      const result = adjustExpandedIndicesAfterRemoval(expandedBadges, 0);
      // Removing index 0:
      // Index 1 becomes 0
      // Index 2 becomes 1
      expect(result.has(0)).to.be.true; // Was index 1
      expect(result.has(1)).to.be.true; // Was index 2
      expect(result.size).to.equal(2);
    });

    it('should handle removing last index', () => {
      const expandedBadges = new Set([0, 1, 2]);
      const result = adjustExpandedIndicesAfterRemoval(expandedBadges, 2);
      expect(result.has(0)).to.be.true;
      expect(result.has(1)).to.be.true;
      expect(result.has(2)).to.be.false; // Removed
    });

    it('should not mutate original set', () => {
      const expandedBadges = new Set([0, 1, 2]);
      const result = adjustExpandedIndicesAfterRemoval(expandedBadges, 1);
      expect(expandedBadges.has(1)).to.be.true; // Original unchanged
      expect(result.has(1)).to.be.true; // But result is adjusted
    });

    it('should handle removing index that is not in expanded set', () => {
      const expandedBadges = new Set([0, 2]);
      const result = adjustExpandedIndicesAfterRemoval(expandedBadges, 1);
      // Removing index 1 (not in set):
      // Index 0 stays 0
      // Index 2 becomes 1
      expect(result.has(0)).to.be.true;
      expect(result.has(1)).to.be.true; // Was index 2
      expect(result.size).to.equal(2);
    });
  });

  describe('removeBadgeItem', () => {
    it('should remove badge at specified index', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_left', mode: 'show_always' },
        { position: 'top_right', mode: 'if_match' },
        { position: 'bottom_left' },
      ];
      const newBadges = removeBadgeItem(badges, 1);
      expect(newBadges).to.have.lengthOf(2);
      expect(newBadges[0]).to.deep.equal(badges[0]);
      expect(newBadges[1]).to.deep.equal(badges[2]);
    });

    it('should remove first badge', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_left' },
        { position: 'top_right' },
      ];
      const newBadges = removeBadgeItem(badges, 0);
      expect(newBadges).to.have.lengthOf(1);
      expect(newBadges[0]).to.deep.equal(badges[1]);
    });

    it('should remove last badge', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_left' },
        { position: 'top_right' },
      ];
      const newBadges = removeBadgeItem(badges, 1);
      expect(newBadges).to.have.lengthOf(1);
      expect(newBadges[0]).to.deep.equal(badges[0]);
    });

    it('should return empty array when removing last badge', () => {
      const badges: BadgeConfig[] = [{ position: 'top_left' }];
      const newBadges = removeBadgeItem(badges, 0);
      expect(newBadges).to.be.an('array');
      expect(newBadges.length).to.equal(0);
    });

    it('should handle undefined badges array', () => {
      const newBadges = removeBadgeItem(undefined, 0);
      expect(newBadges).to.be.an('array');
      expect(newBadges.length).to.equal(0);
    });

    it('should not mutate original array', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_left' },
        { position: 'top_right' },
      ];
      const newBadges = removeBadgeItem(badges, 0);
      expect(badges).to.have.lengthOf(2);
      expect(newBadges).to.have.lengthOf(1);
    });

    it('should handle empty array', () => {
      const badges: BadgeConfig[] = [];
      const newBadges = removeBadgeItem(badges, 0);
      expect(newBadges).to.be.an('array');
      expect(newBadges.length).to.equal(0);
    });
  });

  describe('integration', () => {
    it('should handle complete workflow: add, remove, adjust indices', () => {
      // Start with empty badges
      let badges = addBadge(undefined);
      expect(badges).to.have.lengthOf(1);

      // Add more badges
      badges = addBadge(badges);
      badges = addBadge(badges);
      expect(badges).to.have.lengthOf(3);

      // Simulate expanded badges
      let expandedBadges = new Set([0, 1, 2]);

      // Remove middle badge
      badges = removeBadgeItem(badges, 1);
      expandedBadges = adjustExpandedIndicesAfterRemoval(expandedBadges, 1);

      expect(badges).to.have.lengthOf(2);
      expect(expandedBadges.has(0)).to.be.true;
      expect(expandedBadges.has(1)).to.be.true; // Was index 2
      expect(expandedBadges.has(2)).to.be.false;
    });

    it('should handle removing all badges', () => {
      let badges = addBadge(undefined);
      badges = addBadge(badges);
      expect(badges).to.have.lengthOf(2);

      badges = removeBadgeItem(badges, 0);
      badges = removeBadgeItem(badges, 0);
      expect(badges).to.have.lengthOf(0);
    });
  });
});

import { slugify } from '@hass/common/string/slugify';
import { expect } from 'chai';

export default () => {
  describe('slugify.ts', () => {
    it('should convert spaces to the provided delimiter', () => {
      expect(slugify('hello world')).to.equal('hello_world');
      expect(slugify('hello world', '-')).to.equal('hello-world');
    });

    it('should convert to lowercase', () => {
      expect(slugify('HELLO')).to.equal('hello');
      expect(slugify('Hello World')).to.equal('hello_world');
    });

    it('should replace special characters with their ASCII equivalents', () => {
      expect(slugify('héllò')).to.equal('hello');
      expect(slugify('café')).to.equal('cafe');
      expect(slugify('Größe')).to.equal('grose');
    });

    it('should remove commas between numbers', () => {
      expect(slugify('1,234,567')).to.equal('1234567');
      expect(slugify('price: $1,299.99')).to.equal('price_1299_99');
    });

    it('should replace non-alphanumeric characters with delimiter', () => {
      expect(slugify('email@example.com')).to.equal('email_example_com');
      expect(slugify('a/b/c')).to.equal('a_b_c');
    });

    it('should replace multiple consecutive delimiters with a single one', () => {
      expect(slugify('hello   world')).to.equal('hello_world');
      expect(slugify('a---b___c')).to.equal('a_b_c');
    });

    it('should trim delimiters from the beginning and end', () => {
      expect(slugify('_hello_')).to.equal('hello');
      expect(slugify('-hello world-', '-')).to.equal('hello-world');
    });

    it('should handle empty strings', () => {
      expect(slugify('')).to.equal('');
    });

    it('should convert symbols and punctuation to delimiters', () => {
      expect(slugify('Hello, World!')).to.equal('hello_world');
      expect(slugify('Hello: World?')).to.equal('hello_world');
      expect(slugify('(Hello) [World]')).to.equal('hello_world');
    });

    it('should handle different delimiter options', () => {
      expect(slugify('Hello World', '-')).to.equal('hello-world');
      expect(slugify('Hello World', '~')).to.equal('hello~world');
    });

    it('should handle strings that would result in empty slugs', () => {
      // This test depends on how the implementation handles strings of only special characters
      expect(slugify('hello&world!')).to.equal('hello_world');
      expect(slugify('!@#$%')).to.equal('unknown');
      expect(slugify('   ')).to.equal('unknown');
      expect(slugify('Hello World', '.')).to.equal('unknown');
    });

    it("should handle non-ASCII characters that don't have mapping", () => {
      expect(slugify('你好世界')).to.equal('unknown'); // Chinese characters would be removed
    });

    it('should handle a mix of ASCII and non-ASCII characters', () => {
      expect(slugify('résumé2023')).to.equal('resume2023');
      expect(slugify('München trip')).to.equal('munchen_trip');
    });

    it('should preserve numbers', () => {
      expect(slugify('Page 123')).to.equal('page_123');
      expect(slugify('version1.2.3')).to.equal('version1_2_3');
    });
  });
};

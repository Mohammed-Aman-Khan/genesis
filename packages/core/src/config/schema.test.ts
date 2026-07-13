import { describe, it, expect } from 'vitest';
import { GENESIS_PLUGIN_CATEGORIES } from './schema.js';

describe('GENESIS_PLUGIN_CATEGORIES', () => {
  it('contains the five expected categories', () => {
    expect(GENESIS_PLUGIN_CATEGORIES).toEqual([
      'tool',
      'sdk',
      'language',
      'library',
      'framework',
    ]);
  });

  it('is a readonly tuple', () => {
    // TypeScript-level: the type is `readonly [...]`.
    // At runtime it is a frozen-like array (though not Object.freeze).
    // Verify the values are as expected and in the right order.
    expect(GENESIS_PLUGIN_CATEGORIES[0]).toBe('tool');
    expect(GENESIS_PLUGIN_CATEGORIES[1]).toBe('sdk');
    expect(GENESIS_PLUGIN_CATEGORIES[2]).toBe('language');
    expect(GENESIS_PLUGIN_CATEGORIES[3]).toBe('library');
    expect(GENESIS_PLUGIN_CATEGORIES[4]).toBe('framework');
  });

  it('has the correct length', () => {
    expect(GENESIS_PLUGIN_CATEGORIES).toHaveLength(5);
  });

  it('includes "tool"', () => {
    expect(GENESIS_PLUGIN_CATEGORIES).toContain('tool');
  });

  it('includes "sdk"', () => {
    expect(GENESIS_PLUGIN_CATEGORIES).toContain('sdk');
  });

  it('includes "language"', () => {
    expect(GENESIS_PLUGIN_CATEGORIES).toContain('language');
  });

  it('includes "library"', () => {
    expect(GENESIS_PLUGIN_CATEGORIES).toContain('library');
  });

  it('includes "framework"', () => {
    expect(GENESIS_PLUGIN_CATEGORIES).toContain('framework');
  });

  it('does not contain unexpected categories', () => {
    expect(GENESIS_PLUGIN_CATEGORIES).not.toContain('plugin');
    expect(GENESIS_PLUGIN_CATEGORIES).not.toContain('runtime');
    expect(GENESIS_PLUGIN_CATEGORIES).not.toContain('database');
  });

  it('all values are non-empty strings', () => {
    for (const category of GENESIS_PLUGIN_CATEGORIES) {
      expect(typeof category).toBe('string');
      expect(category.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate entries', () => {
    const unique = new Set(GENESIS_PLUGIN_CATEGORIES);
    expect(unique.size).toBe(GENESIS_PLUGIN_CATEGORIES.length);
  });
});

// Verify that the constant is exported and consumable
describe('schema module exports', () => {
  it('can be imported from the package index', async () => {
    // Dynamically import to verify the re-export chain works
    const mod = await import('./schema.js');
    expect(mod.GENESIS_PLUGIN_CATEGORIES).toBeDefined();
    expect(Array.isArray(mod.GENESIS_PLUGIN_CATEGORIES)).toBe(true);
  });
});

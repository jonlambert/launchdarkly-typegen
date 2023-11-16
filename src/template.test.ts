import { describe, it, expect } from 'vitest';
import { renderFlagType, template } from './template';
import { LaunchDarklyFlag } from './client';

describe('renderFlagType', () => {
  it('handles boolean flags', () => {
    const flag = {
      kind: 'boolean' as const,
      key: 'foobar',
      name: 'Foo Bar',
    } satisfies LaunchDarklyFlag;

    expect(renderFlagType(flag)).toBe('boolean');
  });

  it('handles flags with variations', () => {
    const flag = {
      kind: 'multivariate',
      variations: [{ name: 'var1' }, { name: 'var2' }],
      key: '123',
      name: '123',
    } satisfies LaunchDarklyFlag;
    expect(renderFlagType(flag)).toBe(
      `{ name: 'var1', value: unknown } | { name: 'var2', value: unknown }`
    );
  });

  // Add more tests for edge cases
});

describe('template', () => {
  it('generates a template with standard args', () => {
    const args = {
      flags: [
        {
          key: 'feature1',
          kind: 'boolean',
          name: 'Feature 1',
        } satisfies LaunchDarklyFlag,
      ],
      environments: ['dev', 'prod'],
      flagInterfaceName: 'Flags',
      envTypeName: 'Environment',
    };
    const expectedOutput = `export interface Flags {
  'feature1': boolean;
}

export type AppFlag = keyof Flags;

export type Environment = 'dev' | 'prod';
`;
    expect(template(args)).toBe(expectedOutput);
  });

  // Add more tests for different scenarios
});

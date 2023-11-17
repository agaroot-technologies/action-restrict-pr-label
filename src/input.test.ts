import * as core from '@actions/core';

import { getRules } from './input';

describe('input', () => {
  let inputs: Record<string, string | string[]> = {};

  beforeEach(() => {
    inputs = {};
    jest.spyOn(core, 'getMultilineInput').mockImplementation(name => {
      const value = inputs[name];
      if (!value || !Array.isArray(value)) throw new Error(`Input required and not supplied: ${name}`);
      return value;
    });
  });

  describe('getRules', () => {
    it('Should return rules', () => {
      inputs['rules'] = ['main <- staging [release] [production]'];

      const rules = getRules();

      expect(rules[0]).toEqual({
        base: 'main',
        head: 'staging',
        labels: ['release', 'production'],
      });
    });

    it('Should return rules with glob', () => {
      inputs['rules'] = ['development <- feature/* [feature]', 'development <- bugfix/* [bugfix]'];

      const rules = getRules();

      expect(rules[0]).toEqual({
        base: 'development',
        head: 'feature/*',
        labels: ['feature'],
      });
      expect(rules[1]).toEqual({
        base: 'development',
        head: 'bugfix/*',
        labels: ['bugfix'],
      });
    });

    it('Should return rules with labels containing spaces', () => {
      inputs['rules'] = ['main <- staging [production release]'];

      const rules = getRules();

      expect(rules[0]).toEqual({
        base: 'main',
        head: 'staging',
        labels: ['production release'],
      });
    });

    it('Should throw error when label is not specified', () => {
      inputs['rules'] = ['main <- staging'];

      expect(() => getRules()).toThrow('Invalid rule: main <- staging');
    });

    it('Should throw error when rule is invalid', () => {
      inputs['rules'] = ['invalid'];

      expect(() => getRules()).toThrow('Invalid rule: invalid');
    });
  });
});

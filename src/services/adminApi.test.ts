import { describe, expect, it } from 'vitest';
import {
  changedValues,
  fieldDisplay,
  fieldValue,
  type EditorField,
} from './adminApi';

const bondField: EditorField = {
  name: 'ten_year_bond_yield',
  kind: 'number',
  required: false,
  choices: [],
};

describe('administrator fact values', () => {
  it('converts percentage input to stored ratio and back', () => {
    expect(fieldValue(bondField, '4.25')).toBe('0.0425');
    expect(fieldDisplay(bondField.name, '0.0425')).toBe('4.25');
    expect(fieldValue(bondField, '')).toBeNull();
    expect(fieldValue(bondField, '0')).toBe('0');
  });
  it('preserves large amounts as decimal strings', () => {
    expect(
      fieldValue({ ...bondField, name: 'cfo' }, '12345678901234567890'),
    ).toBe('12345678901234567890');
  });
  it('sends only changes and distinguishes explicit null from zero', () => {
    expect(
      changedValues(
        { cfo: null, growth_capex_estimate: '0', provider: 'DART' },
        { cfo: '100', growth_capex_estimate: null, provider: 'DART' },
      ),
    ).toEqual({ cfo: null, growth_capex_estimate: '0' });
  });
});

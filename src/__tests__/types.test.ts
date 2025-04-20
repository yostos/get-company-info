import { SearchType, ResponseType, ApiType } from '../types';

describe('Types', () => {
  test('SearchType enum contains expected values', () => {
    expect(SearchType.BY_NUMBER).toBe('num');
    expect(SearchType.BY_NAME).toBe('name');
  });

  test('ApiType enum contains expected values', () => {
    expect(ApiType.MOF).toBe('mof');
    expect(ApiType.METI).toBe('meti');
  });

  test('ResponseType enum contains expected values', () => {
    expect(ResponseType.CSV_SHIFT_JIS).toBe('01');
    expect(ResponseType.CSV_UNICODE).toBe('02');
    expect(ResponseType.XML_UNICODE).toBe('12');
    expect(ResponseType.JSON).toBe('json');
  });
});
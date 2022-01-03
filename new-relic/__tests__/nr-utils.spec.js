import Utils from '../nr-utils';

describe('nr utils', () => {
  it('isObject should validate if a value is a object', () => {
    expect(Utils.isObject({})).toEqual(true);

    expect(Utils.isObject(null)).toEqual(false);
    expect(Utils.isObject('123')).toEqual(false);
    expect(Utils.isObject(123)).toEqual(false);
    expect(Utils.isObject(123.9999)).toEqual(false);
    expect(Utils.isObject([])).toEqual(false);
    expect(Utils.isObject(true)).toEqual(false);
    expect(Utils.isObject(false)).toEqual(false);
    expect(Utils.isObject(undefined)).toEqual(false);
  });

  it('isString should validate if a value is a string', () => {
    expect(Utils.isString('super string')).toEqual(true);

    expect(Utils.isString(null)).toEqual(false);
    expect(Utils.isString(123)).toEqual(false);
    expect(Utils.isObject(123.9999)).toEqual(false);
    expect(Utils.isString([])).toEqual(false);
    expect(Utils.isString({})).toEqual(false);
    expect(Utils.isString(true)).toEqual(false);
    expect(Utils.isString(false)).toEqual(false);
    expect(Utils.isString(undefined)).toEqual(false);
  });

  it('isBool should validate if a value is a bool', () => {
    expect(Utils.isBool(true)).toEqual(true);
    expect(Utils.isBool(false)).toEqual(true);

    expect(Utils.isBool(null)).toEqual(false);
    expect(Utils.isBool(123)).toEqual(false);
    expect(Utils.isObject(123.9999)).toEqual(false);
    expect(Utils.isBool([])).toEqual(false);
    expect(Utils.isBool({})).toEqual(false);
    expect(Utils.isBool(undefined)).toEqual(false);
  });

  it('isNumber should validate if a value is a number', () => {
    expect(Utils.isNumber(123)).toEqual(true);
    expect(Utils.isNumber(123.9999)).toEqual(true);

    expect(Utils.isNumber(true)).toEqual(false);
    expect(Utils.isNumber(false)).toEqual(false);
    expect(Utils.isNumber(null)).toEqual(false);
    expect(Utils.isNumber([])).toEqual(false);
    expect(Utils.isNumber({})).toEqual(false);
    expect(Utils.isNumber(undefined)).toEqual(false);
  });

  it('hasValidAttributes should check if attributes ', () => {
    expect(Utils.hasValidAttributes({})).toEqual(true);

    expect(Utils.hasValidAttributes(123)).toEqual(false);
    expect(Utils.hasValidAttributes(123.9999)).toEqual(false);
    expect(Utils.hasValidAttributes(true)).toEqual(false);
    expect(Utils.hasValidAttributes(false)).toEqual(false);
    expect(Utils.hasValidAttributes(null)).toEqual(false);
    expect(Utils.hasValidAttributes([])).toEqual(false);
    expect(Utils.hasValidAttributes(undefined)).toEqual(false);
  });
});

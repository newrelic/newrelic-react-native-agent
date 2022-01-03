import Validator from '../validator';

describe('Validator', () => {
  it('should have attributes for different validations', () => {
    expect(Validator.isString).toEqual('isString');
    expect(Validator.isBool).toEqual('isBool');
    expect(Validator.isNumber).toEqual('isNumber');
    expect(Validator.isObject).toEqual('isObject');
    expect(Validator.notEmptyString).toEqual('notEmptyString');
    expect(Validator.hasValidAttributes).toEqual('hasValidAttributes');
  });

  it('should be able to validate a rule', () => {
    const validateThis = new Validator();
    expect(validateThis.validate(123, ['isNumber'], 'my message')).toEqual(true);
    expect(validateThis.validate(123, ['isString'], 'my message')).toEqual(false);
    expect(validateThis.validate(true, ['isBool'], 'my message')).toEqual(true);
    expect(validateThis.validate({}, ['isObject'], 'my message')).toEqual(true);
    expect(validateThis.validate([], ['isObject'], 'my message')).toEqual(false);
    expect(validateThis.validate('', ['notEmptyString'], 'my message')).toEqual(false);
    expect(validateThis.validate('test', ['notEmptyString'], 'my message')).toEqual(true);
  });
});
